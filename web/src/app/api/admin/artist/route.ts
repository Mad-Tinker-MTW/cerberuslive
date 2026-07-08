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
  suspended?: boolean;
  featured?: boolean;
  managed_imprint?: boolean;
  delete?: boolean;
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

  const db = getDb();

  // Delete the dossier and its dependent rows (no FK cascade across these tables).
  if (body.delete === true) {
    for (const t of ["tracks", "reviews", "follows", "bookings"]) {
      await db.prepare(`DELETE FROM ${t} WHERE artist_slug = ?`).bind(slug).run();
    }
    await db.prepare("DELETE FROM artist_profiles WHERE slug = ?").bind(slug).run();
    return json(200, { ok: true, deleted: slug });
  }

  const sets: string[] = [];
  const vals: (string | number | null)[] = [];
  // `verified` is the single source of truth for verification; the dossier derives
  // its "Media Verified" label from it (signal_status / clearance are retired).
  if (typeof body.verified === "boolean") {
    sets.push("verified = ?");
    vals.push(body.verified ? 1 : 0);
  }
  if (body.gate_status !== undefined) { sets.push("gate_status = ?"); vals.push(body.gate_status); }
  if (body.tier !== undefined) { sets.push("tier = ?"); vals.push(body.tier); }
  if (typeof body.suspended === "boolean") { sets.push("suspended = ?"); vals.push(body.suspended ? 1 : 0); }
  if (typeof body.featured === "boolean") { sets.push("featured = ?"); vals.push(body.featured ? 1 : 0); }
  if (typeof body.managed_imprint === "boolean") {
    // The Cerberus Live Studio imprint is a managed-only credential: grant it only when the artist
    // is (or is being set) managed in this request. Revoking is always allowed.
    if (body.managed_imprint) {
      const effectiveTier =
        body.tier ??
        (await db.prepare("SELECT tier FROM artist_profiles WHERE slug = ?").bind(slug).first<{ tier: string }>())?.tier;
      if (effectiveTier !== "managed") {
        return json(400, { error: "The Cerberus Live Studio imprint is managed-tier only" });
      }
    }
    sets.push("managed_imprint = ?");
    vals.push(body.managed_imprint ? 1 : 0);
  }
  if (sets.length === 0) return json(400, { error: "Nothing to update" });

  sets.push("updated_at = ?");
  vals.push(new Date().toISOString());

  await db.prepare(`UPDATE artist_profiles SET ${sets.join(", ")} WHERE slug = ?`).bind(...vals, slug).run();

  return json(200, { ok: true });
}
