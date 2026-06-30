"use client";

import { useState } from "react";

// Self-managed+ upgrade / manage card in /account (L-048 Phase 6). Free artists upgrade via Stripe
// Checkout; plus artists open the Billing Portal to manage/cancel; managed artists see a badge.
export function BillingCard({
  tier,
  status,
  configured,
  hasCustomer,
}: {
  tier: string;
  status: string | null;
  configured: boolean;
  hasCustomer: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function go(path: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">Plan</h2>

      {tier === "managed" ? (
        <p className="text-sm">
          You&apos;re on the <span className="font-semibold text-red">Managed</span> tier. Live events, showcases,
          and follower email blasts are handled for you.
        </p>
      ) : tier === "plus" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <span className="font-semibold text-red">Self-managed+</span> active
            {status && status !== "active" ? <span className="text-muted"> ({status})</span> : null} — 90 live
            min/week, up to 50 viewers, 1 Mbps.
          </p>
          <button
            type="button"
            onClick={() => go("/api/billing/portal")}
            disabled={busy || !hasCustomer}
            className="h-9 rounded-md border border-border px-4 text-sm text-foreground transition hover:border-red disabled:opacity-50"
          >
            {busy ? "Opening..." : "Manage subscription"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            You&apos;re on the <span className="text-foreground">Free</span> tier (10 live min/week, 25 viewers).
            Upgrade to <span className="font-semibold text-foreground">Self-managed+</span> for 90 min/week, 50
            viewers, and a higher bitrate.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => go("/api/billing/checkout")}
              disabled={busy || !configured}
              className="h-10 rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
            >
              {busy ? "Starting..." : "Upgrade — $29.99/mo"}
            </button>
            {!configured && <span className="text-xs text-muted">Billing isn&apos;t enabled on this deployment yet.</span>}
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-xs text-red">{error}</p>}
    </div>
  );
}
