import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public intake for problem reports / contact. No auth required, but a signed-in
// sender is linked by user_id so the control deck can tie a message to an account.
type Body = { name?: string; email?: string; subject?: string; body?: string };

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  let data: Body;
  try {
    data = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }

  const name = (data.name ?? "").trim();
  const email = (data.email ?? "").trim();
  const subject = (data.subject ?? "").trim();
  const body = (data.body ?? "").trim();

  if (!name || !body) return json(400, { error: "Name and message are required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: "A valid email is required." });
  if (body.length > 5000) return json(400, { error: "Message is too long." });

  // Link to the account if signed in (session is optional here).
  let userId: string | null = null;
  try {
    const session = await authFromContext().api.getSession({ headers: await headers() });
    userId = session?.user.id ?? null;
  } catch {
    userId = null;
  }

  const db = getDb();
  await db
    .prepare(
      "INSERT INTO support_messages (user_id, name, email, subject, body, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)"
    )
    .bind(userId, name, email, subject || null, body, new Date().toISOString())
    .run();

  return json(200, { ok: true });
}
