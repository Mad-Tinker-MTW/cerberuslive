import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { R2Bucket } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

// Serve an artist's photo from R2 (key photos/<slug>). Public: this is the dossier hero image.
// The ?v= cache-buster on photo_url changes on each upload so browsers refetch.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const { env } = getCloudflareContext();
  const bucket = (env as unknown as { IMAGES?: R2Bucket }).IMAGES;
  if (!bucket) return new Response("image storage not configured", { status: 500 });

  const obj = await bucket.get(`photos/${slug}`);
  if (!obj) return new Response("not found", { status: 404 });

  // R2's body type (workers-types ReadableStream) differs from the DOM Response BodyInit.
  return new Response(obj.body as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "image/jpeg",
      "Content-Length": String(obj.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
