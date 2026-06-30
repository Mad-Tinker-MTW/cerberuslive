import { getDb } from "@/lib/db";
import { realtimeConfigured, createRealtimeSession, realtimeProxy } from "@/lib/live";

export const dynamic = "force-dynamic";

// WebRTC (Cloudflare Realtime) negotiation proxy for the free window. Keeps the SFU app
// token server-side: the browser publisher/viewer post offers here and we forward them.
// Only works while the named artist has an active window; gated on operator Realtime creds.
// Body: { slug, op: 'session' | 'tracks' | 'renegotiate', sessionId?, payload? }

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

  if (!realtimeConfigured())
    return json(503, { error: "Live window not configured (operator: set CF_REALTIME_APP_ID + CF_REALTIME_APP_TOKEN)" });

  let body: { slug?: string; op?: string; sessionId?: string; payload?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (body.slug ?? "").trim();
  if (!slug) return json(400, { error: "slug required" });

  // The proxy only operates while this artist has a live window.
  const db = getDb();
  const live = await db
    .prepare("SELECT id FROM live_sessions WHERE artist_slug = ? AND kind = 'window' AND status = 'live' LIMIT 1")
    .bind(slug)
    .first<{ id: number }>();
  if (!live) return json(404, { error: "Artist is not live" });

  try {
    if (body.op === "session") {
      const sessionId = await createRealtimeSession();
      return json(200, { sessionId });
    }
    if (body.op === "tracks" || body.op === "renegotiate") {
      if (!body.sessionId) return json(400, { error: "sessionId required" });
      const path = body.op === "tracks" ? "tracks/new" : "renegotiate";
      const method = body.op === "renegotiate" ? "PUT" : "POST";
      const res = await realtimeProxy(body.sessionId, path, body.payload ?? {}, method);
      const text = await res.text();
      return new Response(text, { status: res.status, headers: { "Content-Type": "application/json" } });
    }
    return json(400, { error: "Unknown op" });
  } catch {
    return json(502, { error: "Realtime proxy error" });
  }
}
