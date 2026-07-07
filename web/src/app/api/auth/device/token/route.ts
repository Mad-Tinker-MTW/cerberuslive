import { checkPollRate, consumeApprovedGrant, getGrantByDeviceCode } from "@/lib/device";

export const dynamic = "force-dynamic";

// Cross-origin from the Tauri agent webview, so CORS headers are required (see the
// device start route). Public poll endpoint; the device_code is the bearer secret.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Desktop polls this with { device_code }. Responds with a status; the desktop
// stops polling on 'success', 'access_denied', or 'expired_token'.
export async function POST(req: Request) {
  const json = (code: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status: code,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
    });

  let body: { device_code?: string };
  try {
    body = (await req.json()) as { device_code?: string };
  } catch {
    return json(400, { error: "invalid_request" });
  }
  const deviceCode = body.device_code?.trim();
  if (!deviceCode) return json(400, { error: "invalid_request" });

  const grant = await getGrantByDeviceCode(deviceCode);
  if (!grant) return json(400, { status: "expired_token" });

  const tooFast = await checkPollRate(grant);
  if (tooFast) return json(200, { status: "slow_down" });

  if (grant.status === "pending") return json(200, { status: "authorization_pending" });
  if (grant.status === "denied") return json(200, { status: "access_denied" });
  if (grant.status === "consumed") return json(200, { status: "expired_token" });
  if (grant.status === "expired") return json(200, { status: "expired_token" });

  // status === 'approved' -> attempt to consume + return keys.
  const result = await consumeApprovedGrant(deviceCode);
  if (!result.ok) {
    // Map internal reasons back to spec-shaped status codes where sensible.
    const passthrough = ["authorization_pending", "access_denied", "expired_token"];
    if (passthrough.includes(result.reason)) return json(200, { status: result.reason });
    return json(200, { status: "error", detail: result.reason });
  }
  const platformUrl = `${new URL(req.url).protocol}//${new URL(req.url).host}`;
  return json(200, { status: "success", platformUrl, ...result.keys });
}
