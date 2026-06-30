import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb, purgeExpiredFollowIntents } from "@/lib/db";
import { sendEmail, emailShell, type MailEnv } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Deferred-follow capture: an anonymous viewer leaves an email mid-show and keeps watching.
// We store a PENDING intent and email a confirm link (it just sits in their inbox; they confirm
// whenever, after the show). Confirming flips it to an email-only follower. Public, idempotent.
type Body = { slug?: string; email?: string };

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  let data: Body;
  try {
    data = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (data.slug ?? "").trim();
  const email = (data.email ?? "").trim().toLowerCase();
  if (!slug) return json(400, { error: "Missing artist" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: "Enter a valid email." });

  const db = getDb();
  await purgeExpiredFollowIntents();

  const artist = await db
    .prepare("SELECT slug, display_name FROM artist_profiles WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first<{ slug: string; display_name: string }>();
  if (!artist) return json(404, { error: "Unknown artist" });

  // Idempotent: if this email already has a pending/confirmed intent for this artist, don't dupe.
  const existing = await db
    .prepare("SELECT status FROM follow_intents WHERE artist_slug = ? AND email = ? AND status IN ('pending','confirmed') LIMIT 1")
    .bind(slug, email)
    .first<{ status: string }>();
  if (existing) {
    return json(200, {
      ok: true,
      already: true,
      message: existing.status === "confirmed" ? "You already follow this artist." : "Already captured. Check your email to confirm.",
    });
  }

  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const liveSession = await db
    .prepare("SELECT id FROM live_sessions WHERE artist_slug = ? AND status = 'live' ORDER BY id DESC LIMIT 1")
    .bind(slug)
    .first<{ id: number }>();

  await db
    .prepare(
      "INSERT INTO follow_intents (artist_slug, email, session_id, token, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)"
    )
    .bind(slug, email, liveSession?.id ?? null, token, now)
    .run();

  // Send the confirm link (best-effort; the intent is captured regardless).
  const confirmUrl = `${new URL(req.url).origin}/api/follow/confirm?token=${token}`;
  let emailed = false;
  try {
    const { env } = getCloudflareContext();
    const html = emailShell(
      `Follow ${artist.display_name}?`,
      `You asked to follow <strong>${artist.display_name}</strong> on Cerberus Live Studio. ` +
        `<a href="${confirmUrl}">Confirm to follow</a> — no rush, finish the show first. ` +
        `If this wasn't you, just ignore this email.`
    );
    const sent = await sendEmail(env as unknown as MailEnv, email, `Follow ${artist.display_name} on Cerberus`, html);
    emailed = sent.ok;
    await db.prepare("UPDATE follow_intents SET emailed_at = ? WHERE token = ?").bind(now, token).run();
  } catch {
    emailed = false;
  }

  return json(200, { ok: true, emailed, message: "Check your email to confirm — no rush, finish the show first." });
}
