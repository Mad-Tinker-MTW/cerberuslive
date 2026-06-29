import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Increment a track's play count. Fired once per load when playback starts.
export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });
  let id = 0;
  try {
    ({ id } = (await req.json()) as { id: number });
  } catch {
    return json(400, { error: "Invalid body" });
  }
  if (!id) return json(400, { error: "id required" });
  await getDb().prepare("UPDATE tracks SET play_count = play_count + 1 WHERE id = ?").bind(id).run();
  return json(200, { ok: true });
}
