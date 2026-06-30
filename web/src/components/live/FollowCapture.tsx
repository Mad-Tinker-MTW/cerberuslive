"use client";

import { useState } from "react";

// Deferred-follow capture on the watch page. An anonymous viewer leaves an email and keeps
// watching; a confirm link lands in their inbox. No account, no navigation away from the stream.
export function FollowCapture({ slug, name }: { slug: string; name: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/follow/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email }),
      });
      const d = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (res.ok) setMsg(d.message || "Check your email to confirm.");
      else setError(d.error || "Could not follow.");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (msg) return <p className="rounded-xl border border-green/40 bg-green/10 p-3 text-sm text-green">{msg}</p>;

  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <p className="mb-2 text-sm text-foreground/85">
        Like {name}? Follow to hear about their next show.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@email.com"
          className="h-10 min-w-0 flex-1 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="h-10 rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "..." : "Follow"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Keep watching, we&apos;ll email a confirm link. No account needed.
      </p>
      {error && <p className="mt-1 text-xs text-red">{error}</p>}
    </div>
  );
}
