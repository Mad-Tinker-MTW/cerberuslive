import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { provisionTunnel, type CfEnv } from "@/lib/cf-tunnel";

export const dynamic = "force-dynamic";

// Provision (or return) the signed-in artist's named media tunnel. Cerberus's Cloudflare account
// creates the tunnel + hidden host t-<slug>.cerberuslive.studio and hands back a run token the
// agent uses with `cloudflared tunnel run --token`. Idempotent: re-provisioning returns the
// existing host + token rather than creating a second tunnel.
export async function POST() {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  const db = getDb();
  const profile = await db
    .prepare("SELECT slug, media_origin, tunnel_token FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string; media_origin: string | null; tunnel_token: string | null }>();
  if (!profile) return json(404, { error: "Claim a dossier first" });

  // Already provisioned -> hand back what we stored (idempotent, lets the artist re-copy the token).
  if (profile.media_origin && profile.tunnel_token) {
    return json(200, { ok: true, mediaOrigin: profile.media_origin, token: profile.tunnel_token, reused: true });
  }

  const { env } = getCloudflareContext();
  try {
    const { mediaOrigin, tunnelId, token } = await provisionTunnel(env as unknown as CfEnv, profile.slug);
    await db
      .prepare("UPDATE artist_profiles SET media_origin = ?, tunnel_id = ?, tunnel_token = ?, updated_at = ? WHERE user_id = ?")
      .bind(mediaOrigin, tunnelId, token, new Date().toISOString(), session.user.id)
      .run();
    return json(200, { ok: true, mediaOrigin, token });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Provisioning failed";
    return json(502, { error: msg });
  }
}
