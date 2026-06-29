import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendEmail, emailShell, type MailEnv } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Admin-only: resolve a support message, or reply (records the reply and emails
// the sender). Reply implies resolved.
type Body = { id?: number; action?: "resolve" | "reply"; body?: string };

type MsgRow = { id: number; email: string; name: string; subject: string | null };

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
  const id = Number(data.id);
  if (!Number.isInteger(id)) return json(400, { error: "id required" });

  const db = getDb();
  const now = new Date().toISOString();

  if (data.action === "resolve") {
    await db.prepare("UPDATE support_messages SET status = 'resolved' WHERE id = ?").bind(id).run();
    return json(200, { ok: true });
  }

  if (data.action === "reply") {
    const reply = (data.body ?? "").trim();
    if (!reply) return json(400, { error: "Reply body required" });
    const msg = await db
      .prepare("SELECT id, email, name, subject FROM support_messages WHERE id = ?")
      .bind(id)
      .first<MsgRow>();
    if (!msg) return json(404, { error: "Message not found" });

    const { env } = getCloudflareContext();
    const subject = msg.subject ? `Re: ${msg.subject}` : "Re: your message to Cerberus Live Studio";
    const html = emailShell(
      `Hi ${msg.name},`,
      reply.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")
    );
    const sent = await sendEmail(env as unknown as MailEnv, msg.email, subject, html);

    await db
      .prepare("UPDATE support_messages SET admin_reply = ?, replied_at = ?, status = 'resolved' WHERE id = ?")
      .bind(reply, now, id)
      .run();

    // dev (no RESEND_KEY) still records the reply; report whether email actually sent.
    return json(200, { ok: true, emailed: sent.ok, dev: sent.dev ?? false });
  }

  return json(400, { error: "Unknown action" });
}
