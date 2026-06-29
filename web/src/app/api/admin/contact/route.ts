import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendEmail, emailShell, type MailEnv } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Admin-only: send an email to a user from the control deck.
type Body = { userId?: string; subject?: string; body?: string };

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return json(403, { error: "Admin only" });

  let data: Body;
  try {
    data = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const userId = (data.userId ?? "").trim();
  const subject = (data.subject ?? "").trim();
  const body = (data.body ?? "").trim();
  if (!userId) return json(400, { error: "userId required" });
  if (!subject || !body) return json(400, { error: "Subject and message required" });

  const db = getDb();
  const u = await db
    .prepare("SELECT email, name FROM user WHERE id = ?")
    .bind(userId)
    .first<{ email: string; name: string | null }>();
  if (!u) return json(404, { error: "User not found" });

  const { env } = getCloudflareContext();
  const html = emailShell(
    u.name ? `Hi ${u.name},` : "Hello,",
    body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")
  );
  const sent = await sendEmail(env as unknown as MailEnv, u.email, subject, html);

  return json(200, { ok: true, emailed: sent.ok, dev: sent.dev ?? false, to: u.email });
}
