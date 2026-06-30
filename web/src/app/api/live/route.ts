import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb, FREE_WINDOW } from "@/lib/db";
import {
  realtimeConfigured,
  streamConfigured,
  createRealtimeSession,
  createStreamLiveInput,
} from "@/lib/live";

export const dynamic = "force-dynamic";

// Go live / end live for the signed-in artist. Body: { op: 'start'|'stop', kind?, title? }.
//   start kind='window' -> free WebRTC window (capped). Provisions a CF Realtime session
//     when configured; otherwise the session row + LIVE status still work (media gated).
//   start kind='event'  -> managed Stream Live (managed tier only). Returns RTMP creds.

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  let body: { op?: string; kind?: string; title?: string };
  try {
    body = (await req.json()) as { op?: string; kind?: string; title?: string };
  } catch {
    return json(400, { error: "Invalid body" });
  }

  const db = getDb();
  const artist = await db
    .prepare("SELECT slug, tier FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string; tier: string }>();
  if (!artist) return json(404, { error: "No artist profile" });
  const slug = artist.slug;
  const now = new Date().toISOString();

  if (body.op === "stop") {
    await db
      .prepare("UPDATE live_sessions SET status='ended', ended_at=? WHERE artist_slug=? AND status='live'")
      .bind(now, slug)
      .run();
    return json(200, { ok: true, status: "ended" });
  }

  if (body.op !== "start") return json(400, { error: "Unknown op" });

  const kind = body.kind === "event" ? "event" : "window";
  const title = (body.title ?? "").trim() || null;

  // One live session at a time.
  await db.prepare("UPDATE live_sessions SET status='ended', ended_at=? WHERE artist_slug=? AND status='live'").bind(now, slug).run();

  if (kind === "event") {
    if (artist.tier !== "managed")
      return json(403, { error: "Managed live events are a managed-tier feature" });
    if (!streamConfigured())
      return json(503, { error: "Stream Live not configured (operator: set CF_API_TOKEN + CF_ACCOUNT_ID with Stream:Edit)" });
    let input;
    try {
      input = await createStreamLiveInput(`${slug} live ${now}`);
    } catch {
      return json(502, { error: "Could not create Stream live input" });
    }
    const res = await db
      .prepare(
        "INSERT INTO live_sessions (artist_slug, kind, status, title, provider_id, playback_id, started_at) VALUES (?, 'event', 'live', ?, ?, ?, ?)"
      )
      .bind(slug, title, input.uid, input.uid, now)
      .run();
    return json(200, {
      ok: true,
      id: res.meta.last_row_id,
      kind,
      rtmpUrl: input.rtmpUrl,
      streamKey: input.streamKey,
      playbackId: input.uid,
    });
  }

  // Free window.
  let providerId: string | null = null;
  let configured = false;
  if (realtimeConfigured()) {
    configured = true;
    try {
      providerId = await createRealtimeSession();
    } catch {
      return json(502, { error: "Could not create Realtime session" });
    }
  }
  const res = await db
    .prepare(
      "INSERT INTO live_sessions (artist_slug, kind, status, title, provider_id, viewer_cap, minutes_cap, started_at) VALUES (?, 'window', 'live', ?, ?, ?, ?, ?)"
    )
    .bind(slug, title, providerId, FREE_WINDOW.viewerCap, FREE_WINDOW.minutesCap, now)
    .run();
  return json(200, {
    ok: true,
    id: res.meta.last_row_id,
    kind,
    sessionId: providerId,
    realtimeConfigured: configured,
    viewerCap: FREE_WINDOW.viewerCap,
    minutesCap: FREE_WINDOW.minutesCap,
  });
}
