import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { R2Bucket } from "@cloudflare/workers-types";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Artist photo upload. Session-authed, owner-only. Stores one image per artist in R2 at the
// deterministic key photos/<slug> (overwrite on re-upload) and points photo_url at the serving
// route with a cache-busting version. Served back by /api/media/photo/[slug].
const MAX_BYTES = 5 * 1024 * 1024;
const OK_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  const db = getDb();
  const profile = await db
    .prepare("SELECT slug FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string }>();
  if (!profile) return json(404, { error: "Claim a dossier first" });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: "Expected multipart form data" });
  }
  const file = form.get("photo");
  if (!(file instanceof File)) return json(400, { error: "No photo file" });
  if (file.size === 0) return json(400, { error: "Empty file" });
  if (file.size > MAX_BYTES) return json(413, { error: "Image too large (max 5 MB)" });
  if (!OK_TYPES.has(file.type)) return json(415, { error: "Use PNG, JPEG, WebP, or GIF" });

  const { env } = getCloudflareContext();
  const bucket = (env as unknown as { IMAGES?: R2Bucket }).IMAGES;
  if (!bucket) return json(500, { error: "Image storage not configured" });

  const key = `photos/${profile.slug}`;
  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

  const version = Date.now();
  const photoUrl = `/api/media/photo/${encodeURIComponent(profile.slug)}?v=${version}`;
  await db
    .prepare("UPDATE artist_profiles SET photo_url = ?, updated_at = ? WHERE slug = ?")
    .bind(photoUrl, new Date().toISOString(), profile.slug)
    .run();

  return json(200, { ok: true, photoUrl });
}
