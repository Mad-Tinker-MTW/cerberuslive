import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { R2Bucket } from "@cloudflare/workers-types";

export const dynamic = "force-dynamic";

// Serve the current Cerberus Agent Windows installer from R2 (bucket IMAGES,
// key installers/cerberus-agent-latest-x64-setup.exe). Public: this is the
// artist-facing download link surfaced on /account and /device.
export async function GET() {
  const { env } = getCloudflareContext();
  const bucket = (env as unknown as { IMAGES?: R2Bucket }).IMAGES;
  if (!bucket) return new Response("installer storage not configured", { status: 500 });

  const obj = await bucket.get("installers/cerberus-agent-latest-x64-setup.exe");
  if (!obj) {
    return new Response(
      JSON.stringify({ error: "Installer not published yet." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(obj.body as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.microsoft.portable-executable",
      "Content-Length": String(obj.size),
      "Content-Disposition": 'attachment; filename="Cerberus Agent Setup.exe"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
