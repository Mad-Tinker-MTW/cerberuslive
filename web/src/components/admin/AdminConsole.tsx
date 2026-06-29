"use client";

import { useState } from "react";

export type PendingReview = {
  id: number;
  artist_slug: string;
  reviewer_name: string;
  rating: number;
  body: string | null;
  sentiment: string | null;
  created_at: string;
};
export type AdminArtist = {
  slug: string;
  display_name: string;
  tier: string;
  verified: number;
  gate_status: string | null;
  tunnel_url: string | null;
  neg: number;
};
export type AdminBooking = {
  artist_slug: string;
  requester_name: string;
  kind: string;
  status: string;
  routed_to: string | null;
  created_at: string;
};

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h2>
        <span className="text-xs text-muted/60">{count}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

export function AdminConsole({
  reviews,
  artists,
  bookings,
}: {
  reviews: PendingReview[];
  artists: AdminArtist[];
  bookings: AdminBooking[];
}) {
  const [pending, setPending] = useState(reviews);
  const [arts, setArts] = useState(artists);
  const [busy, setBusy] = useState<string | null>(null);

  async function moderate(id: number, action: "approve" | "reject") {
    setBusy(`r${id}`);
    const res = await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) setPending((p) => p.filter((r) => r.id !== id));
    setBusy(null);
  }

  async function setArtist(slug: string, patch: Record<string, unknown>) {
    setBusy(slug);
    const res = await fetch("/api/admin/artist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, ...patch }),
    });
    if (res.ok) {
      setArts((list) =>
        list.map((a) =>
          a.slug === slug
            ? {
                ...a,
                verified: "verified" in patch ? (patch.verified ? 1 : 0) : a.verified,
                gate_status: "gate_status" in patch ? (patch.gate_status as string) : a.gate_status,
              }
            : a
        )
      );
    }
    setBusy(null);
  }

  return (
    <>
      <Section title="Reviews to moderate" count={pending.length}>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Nothing pending.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-panel p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-sm">
                    <span className="font-semibold">{r.reviewer_name}</span>{" "}
                    <span className="text-muted">on {r.artist_slug}</span>
                  </span>
                  <span className="text-red">{"★".repeat(r.rating)}<span className="text-foreground/20">{"★".repeat(5 - r.rating)}</span></span>
                </div>
                {r.body && <p className="mb-3 text-sm text-foreground/85">{r.body}</p>}
                <div className="flex gap-2">
                  <button type="button" disabled={busy === `r${r.id}`} onClick={() => moderate(r.id, "approve")} className="rounded-md bg-green/20 px-3 py-1.5 text-xs font-medium text-green transition hover:bg-green/30 disabled:opacity-50">Approve</button>
                  <button type="button" disabled={busy === `r${r.id}`} onClick={() => moderate(r.id, "reject")} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-red disabled:opacity-50">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Artists" count={arts.length}>
        <div className="flex flex-col gap-2">
          {arts.map((a) => {
            const gateOpen = (a.gate_status ?? "").toLowerCase() === "open";
            return (
              <div key={a.slug} className="rounded-xl border border-border bg-panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold">{a.display_name}</span>
                    <span className="ml-2 text-xs text-muted">{a.tier}</span>
                    {a.neg >= 2 && (
                      <span className="ml-2 rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-[10px] text-red">
                        ⚠ {a.neg} negative{a.neg === 1 ? "" : "s"}{gateOpen ? " — review" : " — gate closed"}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.tunnel_url ? "bg-green" : "bg-muted/40"}`} />
                      <span className="break-all text-muted">{a.tunnel_url ?? "no agent connected"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy === a.slug} onClick={() => setArtist(a.slug, { verified: a.verified !== 1 })} className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${a.verified ? "bg-green/20 text-green" : "border border-border text-muted hover:border-green hover:text-green"}`}>
                      {a.verified ? "✓ Verified" : "Verify"}
                    </button>
                    <button type="button" disabled={busy === a.slug} onClick={() => setArtist(a.slug, { gate_status: gateOpen ? "Closed" : "Open" })} className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${gateOpen ? "border border-border text-muted hover:border-red hover:text-red" : "bg-red/20 text-red"}`}>
                      Gate: {gateOpen ? "Open" : "Closed"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Recent bookings" count={bookings.length}>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted">No bookings yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {bookings.map((b, i) => (
              <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-panel px-3 py-2 text-xs">
                <span className="font-mono text-muted">{b.created_at.slice(0, 10)}</span>
                <span className="font-medium">{b.requester_name}</span>
                <span className="text-muted">{b.kind} → {b.artist_slug}</span>
                <span className="ml-auto text-muted">{b.routed_to}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
