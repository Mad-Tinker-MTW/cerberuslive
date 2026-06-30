import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { billingConfigured, createPortalSession } from "@/lib/billing";

export const dynamic = "force-dynamic";

// Open the Stripe Billing Portal so the artist can update payment or cancel (L-048 Phase 6).
export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  if (!billingConfigured()) return json(503, { error: "Billing is not enabled yet." });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  const db = getDb();
  const artist = await db
    .prepare("SELECT stripe_customer_id FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ stripe_customer_id: string | null }>();
  if (!artist?.stripe_customer_id) return json(400, { error: "No subscription to manage." });

  const origin = new URL(req.url).origin;
  try {
    const url = await createPortalSession(artist.stripe_customer_id, `${origin}/account`);
    return json(200, { url });
  } catch (e) {
    return json(502, { error: (e as Error).message });
  }
}
