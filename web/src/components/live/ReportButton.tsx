"use client";

import { useState } from "react";

// "Report" on the watch page. Opens a small inline form (no navigation away from the stream),
// posts to /api/report, which lands in the control-deck support inbox. No sign-in required.
export function ReportButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason.trim()) {
      setError("Tell us what's wrong.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, reason }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error || "Could not send the report.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="text-xs text-muted">Report sent. Thank you, our team will review it.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted transition hover:text-red"
      >
        Report this stream
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-panel p-3">
      <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted">Report this stream</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="What's wrong? (abuse, inappropriate content, technical issue...)"
        className="w-full rounded-md border border-border bg-panel-soft px-3 py-2 text-sm outline-none focus:border-red"
      />
      {error && <p className="mt-1 text-xs text-red">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="h-9 rounded-md bg-red px-4 text-xs font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Sending..." : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-9 rounded-md border border-border px-4 text-xs text-muted transition hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
