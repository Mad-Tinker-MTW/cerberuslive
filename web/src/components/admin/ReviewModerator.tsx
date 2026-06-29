"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ModReview = {
  id: number;
  reviewer_name: string;
  rating: number;
  body: string | null;
  created_at: string;
};

/** Approve/reject a single artist's pending reviews, on the artist detail page. */
export function ReviewModerator({ reviews }: { reviews: ModReview[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function moderate(id: number, action: "approve" | "reject") {
    setBusy(id);
    const res = await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  if (reviews.length === 0) return <p className="text-sm text-muted">No reviews waiting.</p>;
  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-panel p-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{r.reviewer_name}</span>
            <span className="text-red">
              {"★".repeat(r.rating)}
              <span className="text-foreground/20">{"★".repeat(5 - r.rating)}</span>
            </span>
          </div>
          {r.body && <p className="mb-3 text-sm text-foreground/85">{r.body}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy === r.id} onClick={() => moderate(r.id, "approve")} className="rounded-md bg-green/20 px-3 py-1.5 text-xs font-medium text-green transition hover:bg-green/30 disabled:opacity-50">Approve</button>
            <button type="button" disabled={busy === r.id} onClick={() => moderate(r.id, "reject")} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-red disabled:opacity-50">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
