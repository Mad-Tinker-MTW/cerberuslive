// Cloudflare named-tunnel provisioning for the media gateway.
//
// Cerberus's own Cloudflare account provisions one named tunnel per artist and hands the agent
// a run token. The artist never touches Cloudflare. The tunnel terminates at the hidden,
// wildcard-covered host t-<slug>.cerberuslive.studio (two-level, so Universal SSL covers it —
// the three-level <slug>.media.* host had no edge cert; see docs/MEDIA-GATEWAY-PLAN.md).
//
// Requires three values on the worker env: CF_API_TOKEN (Cloudflare Tunnel + DNS edit scope),
// CF_ACCOUNT_ID, CF_ZONE_ID (the cerberuslive.studio zone).

const API = "https://api.cloudflare.com/client/v4";
const ZONE_SUFFIX = "cerberuslive.studio";
const AGENT_PORT = 8787; // the local port the Cerberus agent serves on

export type CfEnv = {
  CF_API_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
  CF_ZONE_ID?: string;
};

export type Provisioned = { mediaOrigin: string; tunnelId: string; token: string };

type CfResult<T> = { success: boolean; errors?: { message: string }[]; result?: T };

async function cf<T>(env: CfEnv, path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as CfResult<T>;
  if (!res.ok || !body.success) {
    const msg = body.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body.result as T;
}

/** Create + configure a named tunnel for an artist and route its hidden host. Idempotent at the
 *  caller: pass a slug that has no media_origin yet. Returns the host, tunnel id, and run token. */
export async function provisionTunnel(env: CfEnv, slug: string): Promise<Provisioned> {
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_ZONE_ID) {
    throw new Error("Cloudflare provisioning is not configured (missing CF_API_TOKEN/ACCOUNT/ZONE)");
  }
  const host = `t-${slug}.${ZONE_SUFFIX}`;

  // 1) Create the tunnel (cloudflare-managed config so we set ingress via the API).
  const tunnel = await cf<{ id: string }>(env, `/accounts/${env.CF_ACCOUNT_ID}/cfd_tunnel`, {
    method: "POST",
    body: JSON.stringify({ name: `cerberus-${slug}`, config_src: "cloudflare" }),
  });

  // 2) Fetch the run token the agent will use.
  const token = await cf<string>(env, `/accounts/${env.CF_ACCOUNT_ID}/cfd_tunnel/${tunnel.id}/token`, {
    method: "GET",
  });

  // 3) Ingress: the hidden host -> the agent's local server. Catch-all 404 after.
  await cf(env, `/accounts/${env.CF_ACCOUNT_ID}/cfd_tunnel/${tunnel.id}/configurations`, {
    method: "PUT",
    body: JSON.stringify({
      config: {
        ingress: [
          { hostname: host, service: `http://localhost:${AGENT_PORT}` },
          { service: "http_status:404" },
        ],
      },
    }),
  });

  // 4) Proxied CNAME so the host resolves through Cloudflare to the tunnel.
  await cf(env, `/zones/${env.CF_ZONE_ID}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: host,
      content: `${tunnel.id}.cfargotunnel.com`,
      proxied: true,
    }),
  });

  return { mediaOrigin: host, tunnelId: tunnel.id, token };
}
