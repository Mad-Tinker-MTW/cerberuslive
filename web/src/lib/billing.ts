import { getCloudflareContext } from "@opennextjs/cloudflare";

// Self-managed+ billing via Stripe (L-048 Phase 6). Thin fetch-based Stripe REST client (no SDK
// dependency, matching lib/live.ts), so it runs cleanly on Workers. The OPERATOR provisions the
// Stripe account + secrets; until they are set, billingConfigured() is false and the routes 503.
//
// Secrets (Worker + .dev.vars):
//   STRIPE_SECRET_KEY     - sk_live_... / sk_test_...
//   STRIPE_PRICE_PLUS     - the recurring price id for the $29.99/mo self-managed+ plan
//   STRIPE_WEBHOOK_SECRET - whsec_... for verifying the webhook signature

type BillingEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_PLUS?: string;
  STRIPE_WEBHOOK_SECRET?: string;
};

function billingEnv(): BillingEnv {
  return getCloudflareContext().env as unknown as BillingEnv;
}

export function billingConfigured(): boolean {
  const e = billingEnv();
  return Boolean(e.STRIPE_SECRET_KEY && e.STRIPE_PRICE_PLUS);
}

export function pricePlus(): string {
  return billingEnv().STRIPE_PRICE_PLUS ?? "";
}

/** POST form-encoded params to the Stripe API with the secret key. */
async function stripePost(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const e = billingEnv();
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${e.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const msg = (data?.error as { message?: string } | undefined)?.message ?? `Stripe ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/** Create a Checkout Session for the self-managed+ subscription. Reuses an existing customer when
 *  the artist already has one; otherwise Stripe creates one from the email and we capture its id in
 *  the webhook. client_reference_id carries the artist slug so the webhook can map back. */
export async function createCheckoutSession(args: {
  slug: string;
  email: string;
  customerId: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const params: Record<string, string> = {
    mode: "subscription",
    "line_items[0][price]": pricePlus(),
    "line_items[0][quantity]": "1",
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    client_reference_id: args.slug,
    "metadata[slug]": args.slug,
    allow_promotion_codes: "true",
  };
  if (args.customerId) params.customer = args.customerId;
  else params.customer_email = args.email;
  const session = await stripePost("checkout/sessions", params);
  return String(session.url);
}

/** Create a Billing Portal session so the artist can manage or cancel their subscription. */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripePost("billing_portal/sessions", { customer: customerId, return_url: returnUrl });
  return String(session.url);
}

// --- Webhook verification (Stripe signature, Web Crypto HMAC-SHA256) ------------------

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time-ish hex compare (equal length + accumulated XOR), to avoid leaking via timing. */
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

/** Verify the Stripe-Signature header against the raw payload, then parse the event. Throws on any
 *  mismatch or if the timestamp is outside a 5-minute tolerance (replay guard). */
export async function verifyWebhook(payload: string, sigHeader: string): Promise<StripeEvent> {
  const secret = billingEnv().STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Webhook secret not set");
  let t = "";
  const v1: string[] = [];
  for (const seg of sigHeader.split(",")) {
    const [k, v] = seg.split("=");
    if (k === "t") t = v;
    else if (k === "v1") v1.push(v);
  }
  if (!t || v1.length === 0) throw new Error("Malformed signature header");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`));
  const expected = hex(mac);
  if (!v1.some((sig) => safeEqualHex(sig, expected))) throw new Error("Signature mismatch");

  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) throw new Error("Timestamp out of tolerance");

  return JSON.parse(payload) as StripeEvent;
}
