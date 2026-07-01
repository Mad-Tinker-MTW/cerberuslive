import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { approveGrant, getGrantByUserCode } from "@/lib/device";

export const dynamic = "force-dynamic";

// Session-authed. Approves a pending device grant for the signed-in artist. Refuses
// if the artist has no profile or no streaming provisioned yet — those are prerequisites
// so the desktop's next poll can immediately return real keys instead of a partial state.
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

  const grant = await getGrantByUserCode(userCode);
  if (!grant) return json(404, { error: "unknown_code" });
  if (grant.status !== "pending") return json(409, { error: `grant_${grant.status}` });

  const db = getDb();
  const profile = await db
    .prepare("SELECT slug, media_origin, tunnel_token FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string; media_origin: string | null; tunnel_token: string | null }>();
  if (!profile) return json(428, { error: "needs_profile" });
  if (!profile.media_origin || !profile.tunnel_token) return json(428, { error: "needs_streaming" });

  const result = await approveGrant(userCode, session.user.id);
  if (!result.ok) return json(409, { error: result.reason ?? "could_not_approve" });
  return json(200, { ok: true });
}
