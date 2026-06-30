import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Anonymous live reaction. Only works while the artist has a live window. Ephemeral:
// old rows are purged on write. Body: { slug, emoji } where emoji is from a fixed set.
const REACTIONS = new Set(["heart", "fire", "laugh", "clap", "wow"]);

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  let data: { slug?: string; emoji?: string };
  try {
    data = (await req.json()) as { slug?: string; emoji?: string };
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (data.slug ?? "").trim();
  const emoji = (data.emoji ?? "").trim();
  if (!slug || !REACTIONS.has(emoji)) return json(400, { error: "Bad reaction" });

  const db = getDb();
  const live = await db
    .prepare("SELECT id FROM live_sessions WHERE artist_slug = ? AND status = 'live' LIMIT 1")
    .bind(slug)
    .first<{ id: number }>();
  if (!live) return json(409, { error: "Artist is not live" });

  const now = new Date().toISOString();
  // Purge reactions older than ~2 minutes so the table stays tiny.
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  await db.prepare("DELETE FROM live_reactions WHERE created_at < ?").bind(cutoff).run();
  await db
    .prepare("INSERT INTO live_reactions (artist_slug, emoji, created_at) VALUES (?, ?, ?)")
    .bind(slug, emoji, now)
    .run();

  return json(200, { ok: true });
}
