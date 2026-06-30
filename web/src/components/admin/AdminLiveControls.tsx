"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Force-end (kill) a live session from the control deck Live-now panel.
export function AdminLiveControls({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function end() {
    if (!confirm("Force-end this live stream?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", id }),
      });
      if (res.ok) router.refresh();
      else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error || "Could not end the stream.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={end}
        disabled={busy}
        className="rounded-md border border-red px-3 py-1.5 text-xs font-semibold text-red transition hover:bg-red/10 disabled:opacity-50"
      >
        {busy ? "Ending..." : "Force-end"}
      </button>
      {error && <span className="text-xs text-red">{error}</span>}
    </span>
  );
}
