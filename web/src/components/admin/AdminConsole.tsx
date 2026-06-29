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
  suspended: number;
  featured: number;
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
export type AdminUser = {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  emailVerified: number;
  createdAt: string;
  dossier: string | null;
};
export type WaitlistRow = { email: string; role: string | null; created_at: string };
export type AdminStats = {
  users: number;
  artists: number;
  tracks: number;
  plays: number;
  bookings: number;
  waitlist: number;
};

const ROLES = ["fan", "artist", "venue", "admin"] as const;

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h2>
        {count !== undefined && <span className="text-xs text-muted/60">{count}</span>}
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
  users,
  waitlist,
  stats,
}: {
  reviews: PendingReview[];
  artists: AdminArtist[];
  bookings: AdminBooking[];
  users: AdminUser[];
  waitlist: WaitlistRow[];
  stats: AdminStats;
}) {
  const [pending, setPending] = useState(reviews);
  const [arts, setArts] = useState(artists);
  const [people, setPeople] = useState(users);
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
      if (patch.delete) {
        setArts((list) => list.filter((a) => a.slug !== slug));
      } else {
        setArts((list) =>
          list.map((a) =>
            a.slug === slug
              ? {
                  ...a,
                  verified: "verified" in patch ? (patch.verified ? 1 : 0) : a.verified,
                  gate_status: "gate_status" in patch ? (patch.gate_status as string) : a.gate_status,
                  suspended: "suspended" in patch ? (patch.suspended ? 1 : 0) : a.suspended,
                  featured: "featured" in patch ? (patch.featured ? 1 : 0) : a.featured,
                }
              : a
          )
        );
      }
    }
    setBusy(null);
  }

  async function deleteArtist(slug: string, name: string) {
    if (!confirm(`Delete ${name}'s dossier and all its tracks, reviews, follows, and bookings? This cannot be undone.`)) return;
    await setArtist(slug, { delete: true });
  }

  async function setUserRole(userId: string, role: string) {
    setBusy(`u${userId}`);
    const res = await fetch("/api/admin/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      setPeople((list) => list.map((u) => (u.id === userId ? { ...u, role } : u)));
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (d.error) alert(d.error);
    }
    setBusy(null);
  }

  function exportWaitlist() {
    const rows = [["email", "role", "created_at"], ...waitlist.map((w) => [w.email, w.role ?? "", w.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cerberus-waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const statCards: { label: string; value: number }[] = [
    { label: "Users", value: stats.users },
    { label: "Artists", value: stats.artists },
    { label: "Tracks", value: stats.tracks },
    { label: "Plays", value: stats.plays },
    { label: "Bookings", value: stats.bookings },
    { label: "Waitlist", value: stats.waitlist },
  ];

  return (
    <>
      <section className="mb-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-panel p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-muted">{s.label}</div>
          </div>
        ))}
      </section>

      <Section title="Users" count={people.length}>
        <div className="flex flex-col gap-2">
          {people.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold">{u.username || u.email}</span>
                  {u.username && <span className="ml-2 break-all text-xs text-muted">{u.email}</span>}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="font-mono">{u.createdAt.slice(0, 10)}</span>
                    {u.emailVerified === 1 && <span className="text-green">verified</span>}
                    {u.dossier && (
                      <a href={`/artist/${u.dossier}`} className="text-red hover:underline">/{u.dossier}</a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={busy === `u${u.id}`}
                      onClick={() => setUserRole(u.id, r)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                        (u.role ?? "fan") === r
                          ? "bg-red/20 text-red"
                          : "border border-border text-muted hover:border-red hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

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
              <div key={a.slug} className={`rounded-xl border bg-panel p-4 ${a.suspended ? "border-red/40 opacity-70" : "border-border"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <a href={`/artist/${a.slug}`} className="font-semibold hover:underline">{a.display_name}</a>
                    <span className="ml-2 text-xs text-muted">{a.tier}</span>
                    {a.featured === 1 && <span className="ml-2 rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-[10px] text-red">featured</span>}
                    {a.suspended === 1 && <span className="ml-2 rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-[10px] text-red">suspended</span>}
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
                    <button type="button" disabled={busy === a.slug} onClick={() => setArtist(a.slug, { featured: a.featured !== 1 })} className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${a.featured ? "bg-red/20 text-red" : "border border-border text-muted hover:border-red hover:text-red"}`}>
                      {a.featured ? "★ Featured" : "Feature"}
                    </button>
                    <button type="button" disabled={busy === a.slug} onClick={() => setArtist(a.slug, { suspended: a.suspended !== 1 })} className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${a.suspended ? "bg-red/20 text-red" : "border border-border text-muted hover:border-red hover:text-red"}`}>
                      {a.suspended ? "Suspended" : "Suspend"}
                    </button>
                    <button type="button" disabled={busy === a.slug} onClick={() => deleteArtist(a.slug, a.display_name)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-red disabled:opacity-50">
                      Delete
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

      <Section title="Waitlist" count={waitlist.length}>
        <div className="mb-3">
          <button type="button" onClick={exportWaitlist} disabled={waitlist.length === 0} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground disabled:opacity-50">
            Export CSV
          </button>
        </div>
        {waitlist.length === 0 ? (
          <p className="text-sm text-muted">No signups.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {waitlist.map((w, i) => (
              <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-panel px-3 py-2 text-xs">
                <span className="font-mono text-muted">{w.created_at.slice(0, 10)}</span>
                <span className="break-all font-medium">{w.email}</span>
                {w.role && <span className="ml-auto text-muted">{w.role}</span>}
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
