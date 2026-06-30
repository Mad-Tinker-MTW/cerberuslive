import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb, getActiveLive, countActiveViewers, VIEWER_STALE_MS } from "@/lib/db";

export const dynamic = "force-dynamic";

// Concurrent-viewer cap for the free WebRTC window (L-048 Phase A.6). Viewers heartbeat here so a
// closed tab frees its slot (stale rows are purged on write). Admins and the artist themselves
// bypass the cap and never occupy a counted slot. D1-backed (no Durable Object), the same MVP
// pattern as live reactions. Body: { slug, token, op: 'join' | 'beat' | 'leave' }.
type Body = { slug?: string; token?: string; op?: "join" | "beat" | "leave" };

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  let data: Body;
  try {
    data = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (data.slug ?? "").trim();
  const token = (data.token ?? "").trim();
  const op = data.op ?? "join";
  if (!slug || !token) return json(400, { error: "slug and token required" });

  // Only a live WebRTC window has a viewer cap to enforce.
  const live = await getActiveLive(slug);
  if (!live || live.kind !== "window") return json(409, { error: "Artist is not live" });

  const db = getDb();
  const now = new Date().toISOString();

  // Leave frees the slot immediately (best-effort; the stale purge is the backstop).
  if (op === "leave") {
    await db
      .prepare("DELETE FROM live_viewers WHERE session_id = ? AND viewer_token = ?")
      .bind(live.id, token)
      .run();
    return json(200, { ok: true });
  }

  // Privileged viewers (an admin, or the artist watching their own window) bypass the cap and are
  // never counted, so a moderator can always drop in even on a full window.
  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (session) {
    const role = (session.user as { role?: string }).role;
    let privileged = role === "admin";
    if (!privileged) {
      const owns = await db
        .prepare("SELECT 1 AS x FROM artist_profiles WHERE slug = ? AND user_id = ? LIMIT 1")
        .bind(slug, session.user.id)
        .first<{ x: number }>();
      privileged = Boolean(owns);
    }
    if (privileged) return json(200, { ok: true, privileged: true });
  }

  // Reclaim stale slots before counting.
  const cutoff = new Date(Date.now() - VIEWER_STALE_MS).toISOString();
  await db
    .prepare("DELETE FROM live_viewers WHERE session_id = ? AND last_seen < ?")
    .bind(live.id, cutoff)
    .run();

  // Enforce the cap only on join — an existing viewer's beat always keeps its held slot.
  const cap = live.viewer_cap ?? 0;
  if (op === "join" && cap > 0) {
    const current = await countActiveViewers(live.id, token);
    if (current >= cap) return json(403, { error: "full", viewerCap: cap });
  }

  await db
    .prepare(
      "INSERT INTO live_viewers (session_id, artist_slug, viewer_token, last_seen) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT(session_id, viewer_token) DO UPDATE SET last_seen = excluded.last_seen"
    )
    .bind(live.id, slug, token, now)
    .run();

  const viewers = await countActiveViewers(live.id);
  return json(200, { ok: true, viewers, viewerCap: cap });
}
