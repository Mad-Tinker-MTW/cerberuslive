import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-only: force-end (kill) any live session for moderation.
type Body = { action?: "end"; id?: number };

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
  if (data.action !== "end") return json(400, { error: "Unknown action" });

  const db = getDb();
  await db
    .prepare("UPDATE live_sessions SET status = 'ended', ended_at = ? WHERE id = ? AND status = 'live'")
    .bind(new Date().toISOString(), id)
    .run();
  return json(200, { ok: true });
}
