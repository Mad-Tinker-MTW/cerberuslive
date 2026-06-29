import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

// A fan submits a booking request or message from an artist's dossier.
// Notification routing:
//   - managed artist (tier='managed')  -> admin (Cerberus handles it)
//   - everyone else                    -> the artist's own contact email
// Reply-to is set to the requester so the recipient can answer the fan directly.

const FROM = "Cerberus Live Studio <noreply@cerberuslive.studio>";
const ADMIN_ADDRESS = "admin@cerberuslive.studio"; // Cloudflare forwards to the admin inbox

type Body = {
  slug?: string;
  requesterName?: string;
  requesterEmail?: string;
  eventDate?: string;
  message?: string;
  kind?: "booking" | "message";
};

type ArtistRow = {
  slug: string;
  display_name: string;
  tier: string;
  contact_email: string | null;
  booking_email: string | null;
  user_id: string | null;
  gate_status: string | null;
};

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (body.slug ?? "").trim();
  const name = (body.requesterName ?? "").trim();
  const email = (body.requesterEmail ?? "").trim();
  const kind = body.kind === "message" ? "message" : "booking";
  if (!slug || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "Name and a valid email are required" });
  }

  const db = getDb();
  const artist = await db
    .prepare(
      "SELECT slug, display_name, tier, contact_email, booking_email, user_id, gate_status FROM artist_profiles WHERE slug = ? LIMIT 1"
    )
    .bind(slug)
    .first<ArtistRow>();
  if (!artist) return json(404, { error: "Artist not found" });

  // Booking ability removed when the gate is closed (escalation outcome). Messages still allowed.
  if (kind === "booking" && (artist.gate_status ?? "").toLowerCase() === "closed") {
    return json(403, { error: "This artist is not currently accepting bookings." });
  }

  // Resolve the notification recipient.
  const managed = artist.tier === "managed";
  let recipient = ADMIN_ADDRESS;
  if (!managed) {
    recipient = artist.contact_email || artist.booking_email || "";
    if (!recipient && artist.user_id) {
      const u = await db
        .prepare("SELECT email FROM user WHERE id = ? LIMIT 1")
        .bind(artist.user_id)
        .first<{ email: string }>();
      recipient = u?.email ?? "";
    }
    if (!recipient) recipient = ADMIN_ADDRESS; // fail safe to admin
  }

  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO bookings (artist_slug, requester_name, requester_email, event_date, message, kind, status, routed_to, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)"
    )
    .bind(slug, name, email, body.eventDate ?? null, body.message ?? null, kind, recipient, now)
    .run();

  // Send the notification (best-effort; the request is already recorded).
  const { env } = getCloudflareContext();
  const resendKey = (env as unknown as { RESEND_KEY?: string }).RESEND_KEY;
  if (resendKey) {
    const subject =
      kind === "message"
        ? `[Cerberus] Message for ${artist.display_name} — ${name}`
        : `[Cerberus] Booking request: ${artist.display_name} — ${name}`;
    const tag = managed ? " (Managed — Cerberus desk)" : "";
    const html = `
      <div style="font-family:system-ui,sans-serif;background:#050505;color:#f2f2f2;padding:24px;border-radius:12px">
        <h2 style="margin:0 0 4px">${kind === "message" ? "New message" : "New booking request"}${tag}</h2>
        <p style="color:#8f8f8f;margin:0 0 16px">For <b style="color:#f2f2f2">${artist.display_name}</b> on Cerberus Live Studio</p>
        <table style="font-size:14px;line-height:1.7">
          <tr><td style="color:#8f8f8f;padding-right:12px">From</td><td>${name} &lt;${email}&gt;</td></tr>
          ${body.eventDate ? `<tr><td style="color:#8f8f8f;padding-right:12px">Date</td><td>${body.eventDate}</td></tr>` : ""}
          ${body.message ? `<tr><td style="color:#8f8f8f;padding-right:12px;vertical-align:top">Message</td><td>${String(body.message).replace(/</g, "&lt;")}</td></tr>` : ""}
        </table>
        <p style="color:#555;font-size:12px;margin-top:16px">Reply directly to this email to reach ${name}.</p>
      </div>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: recipient, reply_to: email, subject, html }),
      });
      if (!res.ok) console.error("[bookings] Resend failed", res.status, await res.text());
    } catch (e) {
      console.error("[bookings] send error", e);
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`[bookings] (no RESEND_KEY) ${kind} for ${slug} -> ${recipient}`);
  }

  return json(200, { ok: true });
}
