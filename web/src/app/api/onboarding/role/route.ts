import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Self-serve role pick at onboarding. Only fan or venue are self-selectable (artist comes from
// claiming a dossier; admin is never self-assignable). Never downgrades an already-elevated role.
export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Sign in first" });

  let body: { role?: string };
  try {
    body = (await req.json()) as { role?: string };
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const role = body.role;
  if (role !== "fan" && role !== "venue") return json(400, { error: "Choose Fan or Venue" });

  const db = getDb();
  await db
    .prepare("UPDATE user SET role = ?, updatedAt = ? WHERE id = ? AND (role IS NULL OR role = 'fan')")
    .bind(role, new Date().toISOString(), session.user.id)
    .run();
  return json(200, { ok: true, role });
}
