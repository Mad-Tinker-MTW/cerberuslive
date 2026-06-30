import { getDb } from "@/lib/db";
import { verifyWebhook } from "@/lib/billing";

export const dynamic = "force-dynamic";

// Stripe webhook (L-048 Phase 6). Stripe calls this (no session); we verify the signature against
// the raw body, then flip tier free<->plus on subscription lifecycle. Managed/admin tiers are never
// touched (the CASE guards only move free->plus and plus->free).
//
// Operator: register this endpoint in Stripe (Developers -> Webhooks) for events
// checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, and set
// STRIPE_WEBHOOK_SECRET to the signing secret.

const KEEP_STATUSES = new Set(["active", "trialing", "past_due"]); // keep plus during dunning

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const payload = await req.text(); // raw body required for signature verification
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event;
  try {
    event = await verifyWebhook(payload, sig);
  } catch (e) {
    return new Response(`Webhook verification failed: ${(e as Error).message}`, { status: 400 });
  }

  const db = getDb();
  const obj = event.data.object;

  if (event.type === "checkout.session.completed") {
    const slug = (obj.client_reference_id as string) || ((obj.metadata as { slug?: string })?.slug ?? "");
    const customer = (obj.customer as string) ?? null;
    const subscription = (obj.subscription as string) ?? null;
    if (slug) {
      await db
        .prepare(
          "UPDATE artist_profiles SET stripe_customer_id = ?, stripe_subscription_id = ?, subscription_status = 'active', " +
            "tier = CASE WHEN tier = 'free' THEN 'plus' ELSE tier END WHERE slug = ?"
        )
        .bind(customer, subscription, slug)
        .run();
    }
  } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const customer = obj.customer as string;
    const status = (obj.status as string) ?? "canceled";
    const deleted = event.type === "customer.subscription.deleted";
    const keepPlus = !deleted && KEEP_STATUSES.has(status);
    if (keepPlus) {
      await db
        .prepare(
          "UPDATE artist_profiles SET subscription_status = ?, stripe_subscription_id = ?, " +
            "tier = CASE WHEN tier = 'free' THEN 'plus' ELSE tier END WHERE stripe_customer_id = ?"
        )
        .bind(status, obj.id as string, customer)
        .run();
    } else {
      // Lapsed/canceled: drop plus back to free (never touch managed/admin).
      await db
        .prepare(
          "UPDATE artist_profiles SET subscription_status = ?, " +
            "tier = CASE WHEN tier = 'plus' THEN 'free' ELSE tier END WHERE stripe_customer_id = ?"
        )
        .bind(deleted ? "canceled" : status, customer)
        .run();
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
