import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-only: approve or reject a pending review.
export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return json(403, { error: "Admin only" });

  let id = 0;
  let action = "";
  try {
    ({ id, action } = (await req.json()) as { id: number; action: string });
  } catch {
    return json(400, { error: "Invalid body" });
  }
  if (!id || !["approve", "reject"].includes(action)) return json(400, { error: "id + approve/reject required" });

  const status = action === "approve" ? "approved" : "rejected";
  const db = getDb();
  await db
    .prepare("UPDATE reviews SET status = ?, moderated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), id)
    .run();

  return json(200, { ok: true, status });
}
