-- Cerberus Live Studio — self-managed+ billing (L-048 Phase 6 / Phase C)
-- Subscription state for the paid self-managed+ tier ($29.99/mo via Stripe). The webhook maps a
-- Stripe customer back to the artist by stripe_customer_id and flips tier free<->plus on
-- subscription active/canceled. Managed and admin tiers are never touched by billing.

ALTER TABLE artist_profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE artist_profiles ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE artist_profiles ADD COLUMN subscription_status TEXT;
