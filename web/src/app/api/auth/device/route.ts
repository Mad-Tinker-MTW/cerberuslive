import { createDeviceGrant } from "@/lib/device";

export const dynamic = "force-dynamic";

// Start a device authorization grant. Public: the desktop agent calls this before
// the user has any session with Cerberus. Returns the codes + polling params.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  try {
    const grant = await createDeviceGrant(baseUrl);
    return new Response(JSON.stringify(grant), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not start device flow.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
