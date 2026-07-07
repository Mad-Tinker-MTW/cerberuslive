import { createDeviceGrant } from "@/lib/device";

export const dynamic = "force-dynamic";

// The desktop agent calls this cross-origin from its Tauri webview (origin
// tauri.localhost), so the device endpoints must send CORS headers or the browser
// discards the response ("Failed to fetch"). Device endpoints are public by design
// (the security is the user code + the operator's approval), so allow any origin.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Start a device authorization grant. Public: the desktop agent calls this before
// the user has any session with Cerberus. Returns the codes + polling params.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  try {
    const grant = await createDeviceGrant(baseUrl);
    return new Response(JSON.stringify(grant), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not start device flow.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
}
