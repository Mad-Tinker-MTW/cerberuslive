import { getDb } from "./db";

// Desktop-agent device authorization grant (RFC 8628 adapted for Cerberus).
//
// Lifecycle:
//   1. Desktop calls createDeviceGrant() -> row inserted with status='pending'.
//   2. Desktop shows the user_code + verification URL and polls getGrantForToken().
//   3. Browser (session-authed artist) calls approveGrant() or denyGrant() with user_code.
//   4. Desktop's next poll returns success (single-use consume + agent-key rotation) or denied/expired.
//
// Codes:
//   - device_code: 32 bytes, base64url, opaque bearer. Given only to the desktop.
//   - user_code:   8 chars, "XXXX-XXXX", base32 without ambiguous glyphs (no 0/O/1/I). Typed by a human.

// 15-minute window matches typical device flows; long enough to sign up + claim + provision.
const EXPIRES_SECONDS = 900;
// Server-side minimum interval between polls per device_code. Clients get slow_down if faster.
const MIN_POLL_INTERVAL_MS = 4500;

const USER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, drops O0/I1/L

function randomUserCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += USER_CODE_ALPHABET[bytes[i]! % USER_CODE_ALPHABET.length];
    if (i === 3) out += "-";
  }
  return out;
}

function randomDeviceCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type DeviceGrantRow = {
  device_code: string;
  user_code: string;
  status: "pending" | "approved" | "denied" | "consumed" | "expired";
  user_id: string | null;
  created_at: string;
  expires_at: string;
  last_poll_at: string | null;
};

export type DeviceStartResult = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

/** Create a fresh pending grant. Retries user_code up to a few times on collision. */
export async function createDeviceGrant(baseUrl: string): Promise<DeviceStartResult> {
  const db = getDb();
  const device_code = randomDeviceCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRES_SECONDS * 1000);
  const createdIso = now.toISOString();
  const expiresIso = expiresAt.toISOString();

  let user_code = "";
  let inserted = false;
  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    user_code = randomUserCode();
    try {
      await db
        .prepare(
          "INSERT INTO device_grants (device_code, user_code, status, created_at, expires_at) VALUES (?, ?, 'pending', ?, ?)"
        )
        .bind(device_code, user_code, createdIso, expiresIso)
        .run();
      inserted = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("UNIQUE")) throw e;
    }
  }
  if (!inserted) throw new Error("Could not allocate a device grant code. Try again.");

  const verification_uri = `${baseUrl}/device`;
  const verification_uri_complete = `${baseUrl}/device?code=${encodeURIComponent(user_code)}`;
  return { device_code, user_code, verification_uri, verification_uri_complete, expires_in: EXPIRES_SECONDS, interval: 5 };
}

export async function getGrantByUserCode(userCode: string): Promise<DeviceGrantRow | null> {
  const db = getDb();
  return await db
    .prepare("SELECT * FROM device_grants WHERE user_code = ? LIMIT 1")
    .bind(userCode.toUpperCase())
    .first<DeviceGrantRow>();
}

export async function getGrantByDeviceCode(deviceCode: string): Promise<DeviceGrantRow | null> {
  const db = getDb();
  return await db
    .prepare("SELECT * FROM device_grants WHERE device_code = ? LIMIT 1")
    .bind(deviceCode)
    .first<DeviceGrantRow>();
}

/** Approve a pending grant for a signed-in artist. */
export async function approveGrant(userCode: string, userId: string): Promise<{ ok: boolean; reason?: string }> {
  const db = getDb();
  const grant = await getGrantByUserCode(userCode);
  if (!grant) return { ok: false, reason: "unknown_code" };
  if (grant.status !== "pending") return { ok: false, reason: `grant_${grant.status}` };
  if (new Date(grant.expires_at) < new Date()) return { ok: false, reason: "expired" };
  await db
    .prepare("UPDATE device_grants SET status = 'approved', user_id = ? WHERE device_code = ?")
    .bind(userId, grant.device_code)
    .run();
  return { ok: true };
}

export async function denyGrant(userCode: string): Promise<{ ok: boolean; reason?: string }> {
  const db = getDb();
  const grant = await getGrantByUserCode(userCode);
  if (!grant) return { ok: false, reason: "unknown_code" };
  if (grant.status !== "pending") return { ok: false, reason: `grant_${grant.status}` };
  await db
    .prepare("UPDATE device_grants SET status = 'denied' WHERE device_code = ?")
    .bind(grant.device_code)
    .run();
  return { ok: true };
}

/**
 * Enforce polling rate. Returns true if caller must slow down. Writes last_poll_at otherwise.
 * Race-tolerant: two near-simultaneous polls will both see the previous timestamp, one will
 * pass. That's acceptable — the intent is anti-hammer, not exact single-flight.
 */
export async function checkPollRate(grant: DeviceGrantRow): Promise<boolean> {
  const now = new Date();
  if (grant.last_poll_at) {
    const dt = now.getTime() - new Date(grant.last_poll_at).getTime();
    if (dt < MIN_POLL_INTERVAL_MS) return true;
  }
  const db = getDb();
  await db
    .prepare("UPDATE device_grants SET last_poll_at = ? WHERE device_code = ?")
    .bind(now.toISOString(), grant.device_code)
    .run();
  return false;
}

/**
 * Mark an approved grant as consumed and return the artist_profiles row the desktop needs
 * (slug + fresh agent_key + tunnel_token + media_origin). Single-use: consuming twice returns
 * grant_consumed. Rotates the agent key so the value we hand back is the only live one.
 */
export async function consumeApprovedGrant(deviceCode: string): Promise<
  | { ok: true; keys: { slug: string; agentKey: string; tunnelToken: string; mediaOrigin: string } }
  | { ok: false; reason: string }
> {
  const db = getDb();
  const grant = await getGrantByDeviceCode(deviceCode);
  if (!grant) return { ok: false, reason: "unknown_grant" };
  if (grant.status === "consumed") return { ok: false, reason: "grant_consumed" };
  if (grant.status === "denied") return { ok: false, reason: "access_denied" };
  if (grant.status === "expired") return { ok: false, reason: "expired_token" };
  if (new Date(grant.expires_at) < new Date()) {
    await db.prepare("UPDATE device_grants SET status = 'expired' WHERE device_code = ?").bind(deviceCode).run();
    return { ok: false, reason: "expired_token" };
  }
  if (grant.status !== "approved") return { ok: false, reason: "authorization_pending" };
  if (!grant.user_id) return { ok: false, reason: "authorization_pending" };

  const profile = await db
    .prepare("SELECT slug, media_origin, tunnel_token FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(grant.user_id)
    .first<{ slug: string; media_origin: string | null; tunnel_token: string | null }>();
  if (!profile) return { ok: false, reason: "profile_missing" };
  if (!profile.media_origin || !profile.tunnel_token) return { ok: false, reason: "streaming_not_provisioned" };

  // Rotate the agent key at consume time so the value returned to the desktop is the only live one.
  const keyBytes = crypto.getRandomValues(new Uint8Array(24));
  const agentKey = btoa(String.fromCharCode(...keyBytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  await db
    .prepare("UPDATE artist_profiles SET agent_key = ?, updated_at = ? WHERE user_id = ?")
    .bind(agentKey, new Date().toISOString(), grant.user_id)
    .run();

  await db.prepare("UPDATE device_grants SET status = 'consumed' WHERE device_code = ?").bind(deviceCode).run();

  return {
    ok: true,
    keys: { slug: profile.slug, agentKey, tunnelToken: profile.tunnel_token, mediaOrigin: profile.media_origin },
  };
}
