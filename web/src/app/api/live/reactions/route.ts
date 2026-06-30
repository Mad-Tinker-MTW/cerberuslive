import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Recent reactions for a live window, for viewers to animate. GET ?slug=X&since=<iso>.
// Returns reactions newer than `since` (default: last 8s) plus the server `now` to use as the
// next poll cursor.
export async function GET(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();
  if (!slug) return json(400, { error: "Missing slug" });
  const since = (url.searchParams.get("since") ?? "").trim() || new Date(Date.now() - 8000).toISOString();

  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT emoji, created_at FROM live_reactions WHERE artist_slug = ? AND created_at > ? ORDER BY created_at LIMIT 100"
    )
    .bind(slug, since)
    .all<{ emoji: string; created_at: string }>();

  return json(200, { reactions: results ?? [], now: new Date().toISOString() });
}
