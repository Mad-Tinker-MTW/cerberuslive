"use client";

import { useState } from "react";
import type { Review } from "@/lib/db";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-red" aria-label={`${n} of 5`}>
      {"★".repeat(n)}
      <span className="text-foreground/20">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ReviewsPanel({
  slug,
  reviews,
}: {
  slug: string;
  reviews: Review[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Name and a valid email are required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, reviewerName: name.trim(), reviewerEmail: email.trim(), rating, body: body.trim() }),
    });
    if (res.ok) setStatus("sent");
    else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Could not submit.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-panel p-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-foreground">{r.reviewer_name}</span>
                <Stars n={r.rating} />
              </div>
              {r.body && <p className="text-sm text-foreground/85">{r.body}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-panel p-6 text-center text-sm text-muted">
          No reviews yet. Worked with this artist? Leave the first one.
        </div>
      )}

      <div className="rounded-xl border border-border bg-panel-soft p-5">
        <h3 className="mb-3 text-xs uppercase tracking-widest text-muted">Leave a review</h3>
        {status === "sent" ? (
          <p className="text-sm text-green">
            Thanks. Your review was submitted and will appear once Cerberus approves it.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="h-11 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted">Rating</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className={`text-xl ${n <= rating ? "text-red" : "text-foreground/20"}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="How was working with them?" rows={3} className="rounded-md border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-red" />
            <button type="submit" disabled={status === "sending"} className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50">
              {status === "sending" ? "Submitting..." : "Submit review"}
            </button>
            {status === "error" && <p className="text-sm text-red">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
