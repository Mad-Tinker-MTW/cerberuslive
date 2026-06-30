import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Low-friction "report this stream" for any watch-page viewer (no sign-in required).
// Writes into the same support_messages queue the control-deck Inbox already shows, tagged
// REPORT so it's triageable. A signed-in reporter is linked by user_id.
type Body = { slug?: string; reason?: string };

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
  const reason = (data.reason ?? "").trim();
  if (!slug) return json(400, { error: "Missing stream" });
  if (!reason) return json(400, { error: "Tell us what's wrong." });
  if (reason.length > 2000) return json(400, { error: "Too long." });

  // Optional signed-in reporter, for accountability + so the operator can follow up.
  let userId: string | null = null;
  let email = "anonymous@report.cerberuslive.studio";
  let name = "Stream report";
  try {
    const session = await authFromContext().api.getSession({ headers: await headers() });
    if (session) {
      userId = session.user.id;
      email = session.user.email ?? email;
      name = session.user.name ? `${session.user.name} (report)` : name;
    }
  } catch {
    /* anonymous report */
  }

  const db = getDb();
  await db
    .prepare(
      "INSERT INTO support_messages (user_id, name, email, subject, body, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)"
    )
    .bind(userId, name, email, `REPORT: live stream /${slug}`, reason, new Date().toISOString())
    .run();

  return json(200, { ok: true });
}
