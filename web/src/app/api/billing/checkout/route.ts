import { headers } from "next/headers";
import { authFromContext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { billingConfigured, createCheckoutSession } from "@/lib/billing";

export const dynamic = "force-dynamic";

// Start a Stripe Checkout for the self-managed+ subscription (L-048 Phase 6). Returns { url } for
// the client to redirect to. The tier flip happens in the webhook on payment, not here.
export async function POST(req: Request) {
  const json = (code: number, b: unknown) =>
    new Response(JSON.stringify(b), { status: code, headers: { "Content-Type": "application/json" } });

  if (!billingConfigured()) return json(503, { error: "Billing is not enabled yet." });

  const session = await authFromContext().api.getSession({ headers: await headers() });
  if (!session) return json(401, { error: "Not signed in" });

  const db = getDb();
  const artist = await db
    .prepare("SELECT slug, tier, stripe_customer_id FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string; tier: string; stripe_customer_id: string | null }>();
  if (!artist) return json(404, { error: "No artist profile" });
  if (artist.tier === "managed") return json(400, { error: "You're on the managed tier." });
  if (artist.tier === "plus") return json(400, { error: "You're already on self-managed+." });

  const origin = new URL(req.url).origin;
  try {
    const url = await createCheckoutSession({
      slug: artist.slug,
      email: session.user.email,
      customerId: artist.stripe_customer_id,
      successUrl: `${origin}/account?upgraded=1`,
      cancelUrl: `${origin}/account`,
    });
    return json(200, { url });
  } catch (e) {
    return json(502, { error: (e as Error).message });
  }
}
