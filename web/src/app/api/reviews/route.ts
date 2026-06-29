import { getDb, sentimentFromRating } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

// A customer submits a review for an artist. Always lands as 'pending' for admin
// moderation (the gate that keeps the Verified badge meaningful). Notifies the
// admin desk that a review is waiting.

const FROM = "Cerberus Live Studio <noreply@cerberuslive.studio>";
const ADMIN_ADDRESS = "admin@cerberuslive.studio";

type Body = {
  slug?: string;
  reviewerName?: string;
  reviewerEmail?: string;
  rating?: number;
  body?: string;
  bookingId?: number;
};

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (body.slug ?? "").trim();
  const name = (body.reviewerName ?? "").trim();
  const email = (body.reviewerEmail ?? "").trim();
  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 0)));
  if (!slug || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !rating) {
    return json(400, { error: "Name, valid email, and a 1-5 rating are required" });
  }

  const db = getDb();
  const artist = await db
    .prepare("SELECT display_name FROM artist_profiles WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first<{ display_name: string }>();
  if (!artist) return json(404, { error: "Artist not found" });

  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO reviews (artist_slug, booking_id, reviewer_name, reviewer_email, rating, body, sentiment, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
    )
    .bind(slug, body.bookingId ?? null, name, email, rating, body.body ?? null, sentimentFromRating(rating), now)
    .run();

  // Notify the admin desk that a review is awaiting moderation.
  const { env } = getCloudflareContext();
  const resendKey = (env as unknown as { RESEND_KEY?: string }).RESEND_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: ADMIN_ADDRESS,
          reply_to: email,
          subject: `[Cerberus] Review to moderate: ${artist.display_name} (${rating}/5)`,
          html: `<div style="font-family:system-ui,sans-serif"><p>New ${sentimentFromRating(rating)} review for <b>${artist.display_name}</b> (${rating}/5) from ${name}.</p><p>${(body.body ?? "").replace(/</g, "&lt;")}</p><p>Moderate it in the admin dashboard.</p></div>`,
        }),
      });
    } catch (e) {
      console.error("[reviews] notify error", e);
    }
  }

  return json(200, { ok: true });
}
