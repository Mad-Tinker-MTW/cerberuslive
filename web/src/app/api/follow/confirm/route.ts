import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Confirm a deferred-follow from the email link. Flips the pending intent to confirmed
// (an email-only follower) and bounces to the artist dossier. GET so it works from a link.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  const home = `${url.origin}/`;
  if (!token) return Response.redirect(home, 302);

  const db = getDb();
  const intent = await db
    .prepare("SELECT id, artist_slug, status FROM follow_intents WHERE token = ? LIMIT 1")
    .bind(token)
    .first<{ id: number; artist_slug: string; status: string }>();
  if (!intent) return Response.redirect(home, 302);

  if (intent.status === "pending") {
    await db
      .prepare("UPDATE follow_intents SET status = 'confirmed', confirmed_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), intent.id)
      .run();
  }
  return Response.redirect(`${url.origin}/artist/${intent.artist_slug}?followed=1`, 302);
}
