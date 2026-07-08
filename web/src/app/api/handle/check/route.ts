import { getDb } from "@/lib/db";
import { validateHandle, isHandleFree, handleSuggestions } from "@/lib/handle";

export const dynamic = "force-dynamic";

// Public availability check for the signup handle picker. GET ?handle=<h> ->
// { available: bool, reason?, suggestions?[] }. Non-numbered suggestions when taken.
export async function GET(req: Request) {
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

  const raw = new URL(req.url).searchParams.get("handle") ?? "";
  const err = validateHandle(raw);
  if (err) return json({ available: false, reason: err });

  const db = getDb();
  if (await isHandleFree(db, raw)) return json({ available: true });

  const suggestions = await handleSuggestions(db, raw);
  return json({ available: false, reason: "That handle is taken.", suggestions });
}
