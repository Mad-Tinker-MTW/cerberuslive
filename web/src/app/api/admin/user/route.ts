import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-only: set a user's role. Roles: fan / artist / venue / admin.
const ROLES = new Set(["fan", "artist", "venue", "admin"]);

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return json(403, { error: "Admin only" });

  let body: { userId?: string; role?: string };
  try {
    body = (await req.json()) as { userId?: string; role?: string };
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const userId = (body.userId ?? "").trim();
  const newRole = (body.role ?? "").trim();
  if (!userId || !ROLES.has(newRole)) return json(400, { error: "userId and a valid role required" });

  // Don't let an admin demote the last remaining admin (lock-out guard).
  if (newRole !== "admin") {
    const target = await getDb()
      .prepare("SELECT role FROM user WHERE id = ? LIMIT 1")
      .bind(userId)
      .first<{ role: string | null }>();
    if (target?.role === "admin") {
      const admins = await getDb()
        .prepare("SELECT COUNT(*) AS n FROM user WHERE role = 'admin'")
        .first<{ n: number }>();
      if ((admins?.n ?? 0) <= 1) return json(409, { error: "Cannot remove the last admin" });
    }
  }

  await getDb()
    .prepare("UPDATE user SET role = ?, updatedAt = ? WHERE id = ?")
    .bind(newRole, new Date().toISOString(), userId)
    .run();

  return json(200, { ok: true, userId, role: newRole });
}
