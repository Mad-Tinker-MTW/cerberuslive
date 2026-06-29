import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Generate (or rotate) the agent key for the signed-in artist's own profile.
// The desktop agent authenticates registration with this key.
export async function POST() {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json" },
    });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  const db = getDb();
  const profile = await db
    .prepare("SELECT slug FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string }>();
  if (!profile) return json(404, { error: "Claim a dossier first" });

  // 32-byte url-safe key.
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const key = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  await db
    .prepare("UPDATE artist_profiles SET agent_key = ?, updated_at = ? WHERE user_id = ?")
    .bind(key, new Date().toISOString(), session.user.id)
    .run();

  return json(200, { ok: true, key, slug: profile.slug });
}
