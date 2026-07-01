import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { denyGrant } from "@/lib/device";

export const dynamic = "force-dynamic";

// Session-authed. Marks a pending device grant as denied so the desktop's next poll
// stops. Signed-in requirement prevents random third parties from denying grants they
// know the user_code of.
export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "not_signed_in" });

  let body: { user_code?: string };
  try {
    body = (await req.json()) as { user_code?: string };
  } catch {
    return json(400, { error: "invalid_request" });
  }
  const userCode = body.user_code?.trim().toUpperCase();
  if (!userCode) return json(400, { error: "invalid_request" });

  const result = await denyGrant(userCode);
  if (!result.ok) return json(409, { error: result.reason ?? "could_not_deny" });
  return json(200, { ok: true });
}
