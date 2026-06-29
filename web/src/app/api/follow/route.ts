import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Toggle the signed-in fan's follow on an artist. Returns the new state + count.
export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Sign in to follow" });

  let slug = "";
  try {
    ({ slug } = (await req.json()) as { slug: string });
  } catch {
    return json(400, { error: "Invalid body" });
  }
  slug = (slug ?? "").trim();
  if (!slug) return json(400, { error: "slug required" });

  const db = getDb();
  const exists = await db
    .prepare("SELECT id FROM follows WHERE artist_slug = ? AND fan_user_id = ? LIMIT 1")
    .bind(slug, session.user.id)
    .first<{ id: number }>();

  let following: boolean;
  if (exists) {
    await db.prepare("DELETE FROM follows WHERE id = ?").bind(exists.id).run();
    following = false;
  } else {
    await db
      .prepare("INSERT INTO follows (artist_slug, fan_user_id, created_at) VALUES (?, ?, ?)")
      .bind(slug, session.user.id, new Date().toISOString())
      .run();
    following = true;
  }

  const c = await db
    .prepare("SELECT COUNT(*) AS n FROM follows WHERE artist_slug = ?")
    .bind(slug)
    .first<{ n: number }>();

  return json(200, { ok: true, following, count: c?.n ?? 0 });
}
