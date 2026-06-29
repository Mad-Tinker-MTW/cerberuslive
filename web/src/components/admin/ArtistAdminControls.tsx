"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ArtistAdminState = {
  slug: string;
  display_name: string;
  tier: string;
  verified: number;
  gate_status: string | null;
  suspended: number;
  featured: number;
};

function Btn({ on, label, onClick, busy, danger }: { on?: boolean; label: string; onClick: () => void; busy: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
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

/** Admin controls for one artist, on the artist detail page. Same /api/admin/artist
 *  endpoint as the console; refreshes server data after each change. */
export function ArtistAdminControls({ a }: { a: ArtistAdminState }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const gateOpen = (a.gate_status ?? "").toLowerCase() === "open";
  const isManaged = a.tier === "managed";

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/admin/artist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: a.slug, ...body }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (d.error) alert(d.error);
    }
  }

  async function remove() {
    if (!confirm(`Delete ${a.display_name}'s dossier and all its tracks, reviews, follows, and bookings? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch("/api/admin/artist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: a.slug, delete: true }),
    });
    setBusy(false);
    if (res.ok) router.push("/admin");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-[10px] uppercase tracking-widest text-muted">Tier</span>
        <span className="text-xs">{isManaged ? "Cerberus Managed" : "Free"}</span>
        <Btn busy={busy} label={isManaged ? "Set Free" : "Promote to Managed"} onClick={() => patch({ tier: isManaged ? "free" : "managed" })} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-[10px] uppercase tracking-widest text-muted">Status</span>
        <Btn on={a.verified === 1} busy={busy} label={a.verified ? "Verified" : "Verify"} onClick={() => patch({ verified: a.verified !== 1 })} />
        <Btn on={!gateOpen} danger busy={busy} label={`Booking: ${gateOpen ? "Open" : "Closed"}`} onClick={() => patch({ gate_status: gateOpen ? "Closed" : "Open" })} />
        <Btn on={a.featured === 1} danger busy={busy} label={a.featured ? "Featured" : "Feature"} onClick={() => patch({ featured: a.featured !== 1 })} />
        <Btn on={a.suspended === 1} danger busy={busy} label={a.suspended ? "Suspended" : "Suspend"} onClick={() => patch({ suspended: a.suspended !== 1 })} />
        <button type="button" disabled={busy} onClick={remove} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-red disabled:opacity-50">Delete</button>
      </div>
    </div>
  );
}
