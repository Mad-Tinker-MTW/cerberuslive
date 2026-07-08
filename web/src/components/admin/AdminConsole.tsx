"use client";

import { Fragment, useState } from "react";

// ---- Data contract (filled by app/admin/page.tsx) -------------------------

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
  tracks: number;
  plays: number;
  followers: number;
  reviews: number;
  avg_rating: number | null;
  neg: number;
  bookings: number;
  open_bookings: number;
  last_active: string | null;
};
export type AdminFan = {
  id: string;
  email: string;
  username: string | null;
  createdAt: string;
  follows: number;
  reviews: number;
  bookings: number;
  last_active: string | null;
};
export type AdminVenue = {
  id: string;
  email: string;
  username: string | null;
  createdAt: string;
};
export type AdminBooking = {
  artist_slug: string;
  requester_name: string;
  kind: string;
  status: string;
  routed_to: string | null;
  created_at: string;
};
export type AdminMetrics = {
  managed: number;
  freeArtists: number;
  fans: number;
  venues: number;
  reviewsPending: number;
  openBookings: number;
  flaggedArtists: number;
  problemReports: number;
  // Platform booking activity (the "people are getting booked" KPIs).
  bookingsTotal: number;
  bookedArtists: number;
  bookings30d: number;
};
export type SupportMessage = {
  id: number;
  user_id: string | null;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  status: string;
  created_at: string;
};

const TABS = ["Overview", "Managed", "Roster", "Fans", "Venues", "Inbox"] as const;
type Tab = (typeof TABS)[number];

// ---- Sort helper ----------------------------------------------------------

type Dir = "asc" | "desc";
function cmp(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}
function sortRows<T>(rows: T[], key: keyof T, dir: Dir): T[] {
  const out = [...rows].sort((a, b) => cmp(a[key], b[key]));
  return dir === "asc" ? out : out.reverse();
}

function short(d: string | null): string {
  return d ? d.slice(0, 10) : "—";
}

// ---- Component ------------------------------------------------------------

export function AdminConsole({
  reviews,
  artists,
  fans,
  venues,
  support,
  metrics,
}: {
  reviews: PendingReview[];
  artists: AdminArtist[];
  fans: AdminFan[];
  venues: AdminVenue[];
  support: SupportMessage[];
  metrics: AdminMetrics;
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [pending, setPending] = useState(reviews);
  const [arts, setArts] = useState(artists);
  const [people, setPeople] = useState(fans);
  const [msgs, setMsgs] = useState(support);
  const [busy, setBusy] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null);

  // Artist + fan table sort state
  const [aKey, setAKey] = useState<keyof AdminArtist>("display_name");
  const [aDir, setADir] = useState<Dir>("asc");
  const [fKey, setFKey] = useState<keyof AdminFan>("createdAt");
  const [fDir, setFDir] = useState<Dir>("desc");

  function aSort(k: keyof AdminArtist) {
    if (k === aKey) setADir((d) => (d === "asc" ? "desc" : "asc"));
    else { setAKey(k); setADir("asc"); }
  }
  function fSort(k: keyof AdminFan) {
    if (k === fKey) setFDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setFKey(k); setFDir("asc"); }
  }

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
                  tier: "tier" in patch ? (patch.tier as string) : a.tier,
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
      // Changing a fan's role moves them out of the Fans list.
      setPeople((list) => list.filter((u) => u.id !== userId));
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (d.error) alert(d.error);
    }
    setBusy(null);
  }

  const managed = sortRows(arts.filter((a) => a.tier === "managed"), aKey, aDir);
  const roster = sortRows(arts.filter((a) => a.tier !== "managed"), aKey, aDir);
  const fanRows = sortRows(people, fKey, fDir);
  const flagged = arts.filter((a) => a.neg >= 2);
  const openMsgs = msgs.filter((m) => m.status === "open");

  return (
    <>
      {/* Tabs */}
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? "border-red text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Overview" && (
        <Overview
          metrics={{ ...metrics, reviewsPending: pending.length, flaggedArtists: flagged.length, problemReports: openMsgs.length }}
          pending={pending}
          flagged={flagged}
          busy={busy}
          moderate={moderate}
          go={setTab}
        />
      )}

      {tab === "Managed" && (
        <ArtistTable
          rows={managed}
          empty="No managed artists yet."
          sortKey={aKey}
          dir={aDir}
          onSort={aSort}
          openRow={openRow}
          setOpenRow={setOpenRow}
          busy={busy}
          setArtist={setArtist}
          deleteArtist={deleteArtist}
        />
      )}

      {tab === "Roster" && (
        <ArtistTable
          rows={roster}
          empty="No free-tier artists."
          sortKey={aKey}
          dir={aDir}
          onSort={aSort}
          openRow={openRow}
          setOpenRow={setOpenRow}
          busy={busy}
          setArtist={setArtist}
          deleteArtist={deleteArtist}
        />
      )}

      {tab === "Fans" && (
        <FanTable
          rows={fanRows}
          sortKey={fKey}
          dir={fDir}
          onSort={fSort}
          openRow={openRow}
          setOpenRow={setOpenRow}
          busy={busy}
          setUserRole={setUserRole}
        />
      )}

      {tab === "Venues" && (
        <div className="rounded-xl border border-border bg-panel p-8 text-center">
          <p className="text-sm text-muted">
            {venues.length === 0
              ? "No venues yet. Venue profiles and tooling are not built."
              : `${venues.length} venue account(s). Venue tooling is not built yet.`}
          </p>
        </div>
      )}

      {tab === "Inbox" && <Inbox msgs={msgs} setMsgs={setMsgs} busy={busy} setBusy={setBusy} />}
    </>
  );
}

// ---- Inbox ----------------------------------------------------------------

function Inbox({
  msgs,
  setMsgs,
  busy,
  setBusy,
}: {
  msgs: SupportMessage[];
  setMsgs: React.Dispatch<React.SetStateAction<SupportMessage[]>>;
  busy: string | null;
  setBusy: (s: string | null) => void;
}) {
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  async function act(id: number, action: "resolve" | "reply", body?: string) {
    setBusy(`m${id}`);
    const res = await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, body }),
    });
    if (res.ok) {
      setMsgs((list) => list.map((m) => (m.id === id ? { ...m, status: "resolved" } : m)));
      setReplyTo(null);
      setReplyText("");
      if (action === "reply") {
        const d = (await res.json().catch(() => ({}))) as { dev?: boolean };
        if (d.dev) alert("Reply recorded. Email was not sent (RESEND_KEY not set in this environment).");
      }
    }
    setBusy(null);
  }

  const open = msgs.filter((m) => m.status === "open");
  const resolved = msgs.filter((m) => m.status !== "open");
  const list = showResolved ? resolved : open;

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          {showResolved ? "Resolved" : "Open"} <span className="text-muted/60">{list.length}</span>
        </h2>
        <button type="button" onClick={() => setShowResolved((s) => !s)} className="ml-auto text-xs text-muted underline-offset-2 transition hover:text-foreground hover:underline">
          {showResolved ? "Show open" : `Show resolved (${resolved.length})`}
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted">{showResolved ? "Nothing resolved yet." : "No open messages."}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-panel p-4">
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-semibold">{m.name}</span>
                <span className="break-all text-xs text-muted">{m.email}</span>
                {m.user_id && <span className="rounded-full border border-border px-1.5 text-[10px] text-muted">account</span>}
                <span className="ml-auto font-mono text-xs text-muted">{m.created_at.slice(0, 10)}</span>
              </div>
              {m.subject && <p className="text-sm font-medium">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">{m.body}</p>

              {m.status === "open" && (
                <div className="mt-3">
                  {replyTo === m.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder={`Reply to ${m.name}...`} className="rounded-md border border-border bg-panel-soft px-3 py-2 text-sm outline-none focus:border-red" />
                      <div className="flex gap-2">
                        <button type="button" disabled={busy === `m${m.id}` || !replyText.trim()} onClick={() => act(m.id, "reply", replyText)} className="rounded-md bg-red px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-dark disabled:opacity-50">Send reply</button>
                        <button type="button" onClick={() => { setReplyTo(null); setReplyText(""); }} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setReplyTo(m.id); setReplyText(""); }} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground">Reply</button>
                      <button type="button" disabled={busy === `m${m.id}`} onClick={() => act(m.id, "resolve")} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-green hover:text-green disabled:opacity-50">Mark resolved</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ---- Overview -------------------------------------------------------------

function MetricCard({ label, value, onClick, alert }: { label: string; value: number; onClick?: () => void; alert?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border bg-panel p-4 text-center transition ${
        onClick ? "hover:border-red" : "cursor-default"
      } ${alert && value > 0 ? "border-red/50" : "border-border"}`}
    >
      <div className={`text-2xl font-bold tabular-nums ${alert && value > 0 ? "text-red" : ""}`}>
        {value.toLocaleString()}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted">{label}</div>
    </button>
  );
}

function Overview({
  metrics,
  pending,
  flagged,
  busy,
  moderate,
  go,
}: {
  metrics: AdminMetrics;
  pending: PendingReview[];
  flagged: AdminArtist[];
  busy: string | null;
  moderate: (id: number, action: "approve" | "reject") => void;
  go: (t: Tab) => void;
}) {
  return (
    <>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">People</h2>
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Managed" value={metrics.managed} onClick={() => go("Managed")} />
        <MetricCard label="Free Artists" value={metrics.freeArtists} onClick={() => go("Roster")} />
        <MetricCard label="Fans" value={metrics.fans} onClick={() => go("Fans")} />
        <MetricCard label="Venues" value={metrics.venues} onClick={() => go("Venues")} />
      </section>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Needs attention</h2>
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Reviews pending" value={metrics.reviewsPending} alert />
        <MetricCard label="Open bookings" value={metrics.openBookings} alert />
        <MetricCard label="Flagged artists" value={metrics.flaggedArtists} alert />
        <MetricCard label="Problem reports" value={metrics.problemReports} onClick={() => go("Inbox")} alert />
      </section>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Booking activity</h2>
      <section className="mb-10 grid grid-cols-3 gap-3">
        <MetricCard label="Bookings (all time)" value={metrics.bookingsTotal} />
        <MetricCard label="Artists booked" value={metrics.bookedArtists} />
        <MetricCard label="Last 30 days" value={metrics.bookings30d} />
      </section>

      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        Reviews to moderate <span className="text-muted/60">{pending.length}</span>
      </h2>
      {pending.length === 0 ? (
        <p className="mb-10 text-sm text-muted">Nothing pending.</p>
      ) : (
        <div className="mb-10 flex flex-col gap-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-panel p-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-sm">
                  <span className="font-semibold">{r.reviewer_name}</span>{" "}
                  <span className="text-muted">on {r.artist_slug}</span>
                </span>
                <span className="text-red">
                  {"★".repeat(r.rating)}
                  <span className="text-foreground/20">{"★".repeat(5 - r.rating)}</span>
                </span>
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

      {flagged.length > 0 && (
        <>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Flagged artists <span className="text-muted/60">{flagged.length}</span>
          </h2>
          <div className="flex flex-col gap-1.5">
            {flagged.map((a) => (
              <button key={a.slug} type="button" onClick={() => go(a.tier === "managed" ? "Managed" : "Roster")} className="flex items-center gap-3 rounded-md border border-red/40 bg-red/5 px-3 py-2 text-left text-xs transition hover:border-red">
                <span className="font-medium">{a.display_name}</span>
                <span className="text-red">⚠ {a.neg} negative{a.neg === 1 ? "" : "s"}</span>
                <span className="ml-auto text-muted">{(a.gate_status ?? "").toLowerCase() === "open" ? "gate open — review" : "gate closed"}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ---- Artist table ---------------------------------------------------------

function Th({ label, k, sortKey, dir, onSort, num }: { label: string; k: string; sortKey: string; dir: Dir; onSort: (k: never) => void; num?: boolean }) {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onSort(k as never)}
      className={`cursor-pointer select-none whitespace-nowrap px-2 py-2 text-[10px] uppercase tracking-widest text-muted transition hover:text-foreground ${num ? "text-right" : "text-left"}`}
    >
      {label}
      {active ? (dir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );
}

function ArtistTable({
  rows,
  empty,
  sortKey,
  dir,
  onSort,
  openRow,
  setOpenRow,
  busy,
  setArtist,
  deleteArtist,
}: {
  rows: AdminArtist[];
  empty: string;
  sortKey: keyof AdminArtist;
  dir: Dir;
  onSort: (k: keyof AdminArtist) => void;
  openRow: string | null;
  setOpenRow: (s: string | null) => void;
  busy: string | null;
  setArtist: (slug: string, patch: Record<string, unknown>) => void;
  deleteArtist: (slug: string, name: string) => void;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <Th label="Artist" k="display_name" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} />
            <Th label="Tracks" k="tracks" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Plays" k="plays" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Followers" k="followers" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Reviews" k="reviews" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Bookings" k="bookings" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Active" k="last_active" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} />
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const open = openRow === a.slug;
            return (
              <Fragment key={a.slug}>
                <tr className={`border-b border-border/60 ${a.suspended ? "opacity-60" : ""}`}>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${a.tunnel_url ? "bg-green" : "bg-muted/40"}`} title={a.tunnel_url ? "agent connected" : "no agent"} />
                      <a href={`/admin/artist/${a.slug}`} className="font-medium hover:underline">{a.display_name}</a>
                      {a.verified === 1 && <span className="text-green" title="verified">✓</span>}
                      {a.featured === 1 && <span className="text-red" title="featured">★</span>}
                      {a.suspended === 1 && <span className="text-[10px] text-red">suspended</span>}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{a.tracks}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{a.plays.toLocaleString()}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{a.followers}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {a.reviews}
                    {a.avg_rating != null && <span className="text-muted"> · {a.avg_rating.toFixed(1)}★</span>}
                    {a.neg >= 2 && <span className="text-red" title={`${a.neg} negative`}> ⚠</span>}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {a.bookings}
                    {a.open_bookings > 0 && <span className="text-red"> ({a.open_bookings})</span>}
                  </td>
                  <td className="px-2 py-2.5 font-mono text-xs text-muted">{short(a.last_active)}</td>
                  <td className="px-2 py-2.5 text-right">
                    <button type="button" onClick={() => setOpenRow(open ? null : a.slug)} className="rounded-md border border-border px-2 py-1 text-xs text-muted transition hover:border-red hover:text-foreground">
                      {open ? "Close" : "Manage"}
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr className="border-b border-border/60 bg-panel-soft/40">
                    <td colSpan={8} className="px-2 py-3">
                      <ArtistControls a={a} busy={busy} setArtist={setArtist} deleteArtist={deleteArtist} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ControlBtn({ on, label, onClick, busy, danger, title }: { on?: boolean; label: string; onClick: () => void; busy: boolean; danger?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      disabled={busy}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        on
          ? danger ? "bg-red/20 text-red" : "bg-green/20 text-green"
          : `border border-border text-muted hover:border-red ${danger ? "hover:text-red" : "hover:text-foreground"}`
      }`}
    >
      {label}
    </button>
  );
}

function ArtistControls({ a, busy, setArtist, deleteArtist }: { a: AdminArtist; busy: string | null; setArtist: (slug: string, patch: Record<string, unknown>) => void; deleteArtist: (slug: string, name: string) => void }) {
  const b = busy === a.slug;
  // An unset gate means bookings are open (matches the dossier + /api/bookings, which
  // only block when gate_status is explicitly "closed"). Checking === "open" here made a
  // never-touched artist render as "Closed" while their dossier still accepted bookings.
  const gateOpen = (a.gate_status ?? "").toLowerCase() !== "closed";
  const isManaged = a.tier === "managed";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted">Tier</span>
        <span className="text-xs">{isManaged ? "Cerberus Managed" : "Free"}</span>
        <ControlBtn on={false} busy={b} title="Switch tier. Free = artist self-hosts media through their own tunnel (no R2). Cerberus Managed = Cerberus hosts the media (R2) and runs the managed service. Click to toggle." label={isManaged ? "Set Free" : "Promote to Managed"} onClick={() => setArtist(a.slug, { tier: isManaged ? "free" : "managed" })} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted">Status</span>
        <ControlBtn on={a.verified === 1} busy={b} title="Verified badge. On = the dossier shows a green Verified check (you vouch the artist and their media are legitimate). Click to toggle." label={a.verified ? "Verified" : "Verify"} onClick={() => setArtist(a.slug, { verified: a.verified !== 1 })} />
        <ControlBtn on={!gateOpen} danger busy={b} title="Booking gate. Open = this artist is accepting booking requests; Closed = not accepting. The label shows the CURRENT state; click to flip it." label={`Booking: ${gateOpen ? "Open" : "Closed"}`} onClick={() => setArtist(a.slug, { gate_status: gateOpen ? "Closed" : "Open" })} />
        <ControlBtn on={a.featured === 1} danger busy={b} title="Featured placement. On = the artist gets a star and is spotlighted on Discover. Click to toggle." label={a.featured ? "Featured" : "Feature"} onClick={() => setArtist(a.slug, { featured: a.featured !== 1 })} />
        <ControlBtn on={a.suspended === 1} danger busy={b} title="Suspend = take the public dossier offline (visitors get a 404) without deleting any data. Reversible. Click to toggle." label={a.suspended ? "Suspended" : "Suspend"} onClick={() => setArtist(a.slug, { suspended: a.suspended !== 1 })} />
        <button type="button" title="Permanently delete this dossier and ALL its tracks, reviews, follows, and bookings. Cannot be undone." disabled={b} onClick={() => deleteArtist(a.slug, a.display_name)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-red disabled:opacity-50">Delete</button>
      </div>
    </div>
  );
}

// ---- Fan table ------------------------------------------------------------

const FAN_ROLES = ["artist", "venue"] as const;

function FanTable({
  rows,
  sortKey,
  dir,
  onSort,
  openRow,
  setOpenRow,
  busy,
  setUserRole,
}: {
  rows: AdminFan[];
  sortKey: keyof AdminFan;
  dir: Dir;
  onSort: (k: keyof AdminFan) => void;
  openRow: string | null;
  setOpenRow: (s: string | null) => void;
  busy: string | null;
  setUserRole: (id: string, role: string) => void;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">No fans yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <Th label="Fan" k="email" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} />
            <Th label="Follows" k="follows" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Reviews" k="reviews" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Bookings" k="bookings" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} num />
            <Th label="Joined" k="createdAt" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} />
            <Th label="Active" k="last_active" sortKey={sortKey} dir={dir} onSort={onSort as (k: never) => void} />
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const open = openRow === `fan-${u.id}`;
            return (
              <Fragment key={u.id}>
                <tr className="border-b border-border/60">
                  <td className="px-2 py-2.5"><a href={`/admin/fan/${u.id}`} className="break-all font-medium hover:underline">{u.username || u.email}</a></td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{u.follows}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{u.reviews}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{u.bookings}</td>
                  <td className="px-2 py-2.5 font-mono text-xs text-muted">{short(u.createdAt)}</td>
                  <td className="px-2 py-2.5 font-mono text-xs text-muted">{short(u.last_active)}</td>
                  <td className="px-2 py-2.5 text-right">
                    <button type="button" onClick={() => setOpenRow(open ? null : `fan-${u.id}`)} className="rounded-md border border-border px-2 py-1 text-xs text-muted transition hover:border-red hover:text-foreground">
                      {open ? "Close" : "Manage"}
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr className="border-b border-border/60 bg-panel-soft/40">
                    <td colSpan={7} className="px-2 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="break-all text-xs text-muted">{u.email}</span>
                        <span className="mx-2 text-[10px] uppercase tracking-widest text-muted">Make</span>
                        {FAN_ROLES.map((r) => (
                          <button key={r} type="button" disabled={busy === `u${u.id}`} onClick={() => setUserRole(u.id, r)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground disabled:opacity-50">
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
