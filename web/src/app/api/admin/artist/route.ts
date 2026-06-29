import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-only: set the earned/admin-controlled fields on an artist
// (verified, signal_status, gate_status, tier). These are never self-editable.
type Body = {
  slug?: string;
  verified?: boolean;
  signal_status?: string | null;
  gate_status?: string | null;
  tier?: string;
};

export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return json(403, { error: "Admin only" });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const slug = (body.slug ?? "").trim();
  if (!slug) return json(400, { error: "slug required" });

  const sets: string[] = [];
  const vals: (string | number | null)[] = [];
  if (typeof body.verified === "boolean") {
    sets.push("verified = ?");
    vals.push(body.verified ? 1 : 0);
    // Keep the hero signal coherent with the verified flag by default.
    if (body.verified && body.signal_status === undefined) {
      sets.push("signal_status = ?");
      vals.push("Media Verified");
    }
  }
  if (body.signal_status !== undefined) { sets.push("signal_status = ?"); vals.push(body.signal_status); }
  if (body.gate_status !== undefined) { sets.push("gate_status = ?"); vals.push(body.gate_status); }
  if (body.tier !== undefined) { sets.push("tier = ?"); vals.push(body.tier); }
  if (sets.length === 0) return json(400, { error: "Nothing to update" });

  sets.push("updated_at = ?");
  vals.push(new Date().toISOString());

  const db = getDb();
  await db.prepare(`UPDATE artist_profiles SET ${sets.join(", ")} WHERE slug = ?`).bind(...vals, slug).run();

  return json(200, { ok: true });
}
