import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb, ownsProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

// Artist profile feed (L-048 Phase B). The signed-in artist creates/deletes their own posts.
//   POST   { body, visibility } -> create a post on the caller's own dossier.
//   DELETE { id }               -> delete one of the caller's own posts.
const MAX_BODY = 2000;

async function callerSlug(): Promise<{ userId: string; slug: string } | null> {
  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return null;
  const db = getDb();
  const row = await db
    .prepare("SELECT slug FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string }>();
  return row ? { userId: session.user.id, slug: row.slug } : null;
}

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const me = await callerSlug();
  if (!me) return json(403, { error: "No artist profile" });

  let data: { body?: string; visibility?: string };
  try {
    data = (await req.json()) as typeof data;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const body = (data.body ?? "").trim();
  const visibility = data.visibility === "followers" ? "followers" : "public";
  if (!body) return json(400, { error: "Post is empty" });
  if (body.length > MAX_BODY) return json(400, { error: `Post too long (max ${MAX_BODY})` });

  const db = getDb();
  const now = new Date().toISOString();
  const res = await db
    .prepare("INSERT INTO posts (artist_slug, body, visibility, created_at) VALUES (?, ?, ?, ?)")
    .bind(me.slug, body, visibility, now)
    .run();
  return json(200, { ok: true, post: { id: res.meta.last_row_id, body, media_url: null, visibility, created_at: now } });
}

export async function DELETE(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const me = await callerSlug();
  if (!me) return json(403, { error: "No artist profile" });

  let data: { id?: number };
  try {
    data = (await req.json()) as typeof data;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const id = Number(data.id);
  if (!Number.isInteger(id)) return json(400, { error: "id required" });
  // Ownership is enforced by scoping the delete to the caller's own slug.
  if (!(await ownsProfile(me.slug, me.userId))) return json(403, { error: "Not allowed" });

  const db = getDb();
  await db.prepare("DELETE FROM posts WHERE id = ? AND artist_slug = ?").bind(id, me.slug).run();
  return json(200, { ok: true });
}
