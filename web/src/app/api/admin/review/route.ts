import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin-only: approve or reject a pending review.
export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return json(403, { error: "Admin only" });

  let id = 0;
  let action = "";
  try {
    ({ id, action } = (await req.json()) as { id: number; action: string });
  } catch {
    return json(400, { error: "Invalid body" });
  }
  if (!id || !["approve", "reject"].includes(action)) return json(400, { error: "id + approve/reject required" });

  const status = action === "approve" ? "approved" : "rejected";
  const db = getDb();
  const now = new Date().toISOString();
  const review = await db
    .prepare("SELECT artist_slug, sentiment FROM reviews WHERE id = ? LIMIT 1")
    .bind(id)
    .first<{ artist_slug: string; sentiment: string | null }>();
  await db
    .prepare("UPDATE reviews SET status = ?, moderated_at = ? WHERE id = ?")
    .bind(status, now, id)
    .run();

  // Escalation: approving a negative review may auto-close the booking gate.
  let escalated = false;
  if (action === "approve" && review?.sentiment === "negative") {
    const c = await db
      .prepare("SELECT COUNT(*) AS n FROM reviews WHERE artist_slug = ? AND status = 'approved' AND sentiment = 'negative'")
      .bind(review.artist_slug)
      .first<{ n: number }>();
    if ((c?.n ?? 0) >= 3) {
      await db
        .prepare("UPDATE artist_profiles SET gate_status = 'Closed', updated_at = ? WHERE slug = ?")
        .bind(now, review.artist_slug)
        .run();
      escalated = true;
    }
  }

  return json(200, { ok: true, status, escalated });
}
