import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { validateHandle, normalizeHandle, isHandleFree } from "@/lib/handle";

export const dynamic = "force-dynamic";

// Set the signed-in user's unique handle. Stores the lowercased key on user.username (unique index)
// and the as-typed form on displayUsername + name (the shown name). The DB unique index is the
// backstop against a race between the pre-check and the write.
export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Sign in first" });

  let body: { handle?: string };
  try {
    body = (await req.json()) as { handle?: string };
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const raw = (body.handle ?? "").trim();
  const err = validateHandle(raw);
  if (err) return json(400, { error: err });

  const db = getDb();
  if (!(await isHandleFree(db, raw, session.user.id))) {
    return json(409, { error: "That handle is taken." });
  }

  const now = new Date().toISOString();
  try {
    await db
      .prepare("UPDATE user SET username = ?, displayUsername = ?, name = ?, updatedAt = ? WHERE id = ?")
      .bind(normalizeHandle(raw), raw, raw, now, session.user.id)
      .run();
  } catch {
    return json(409, { error: "That handle is taken." });
  }
  return json(200, { ok: true, handle: raw });
}
