"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// The signed-in but not-yet-ready artist state on /device. Walks the artist through
// the missing prerequisites (claim dossier, provision streaming) before enabling the
// approval screen. Uses router.refresh so each completed step re-fetches the server
// component and unlocks the next one.
export function DeviceOnboardingSteps({
  hasProfile,
  hasStreaming,
  initialCode,
  defaultName,
}: {
  hasProfile: boolean;
  hasStreaming: boolean;
  initialCode: string;
  defaultName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/profile/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name.trim() }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Could not create the profile.");
      setBusy(false);
    }
  }

  async function setupStreaming() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/agent/provision", { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Could not set up streaming.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {initialCode && (
        <p className="rounded-md border border-border bg-panel-soft px-3 py-2 text-xs text-muted">
          Code from your agent: <span className="font-mono text-foreground">{initialCode}</span>. We&apos;ll
          bring you back to approve it once these are done.
        </p>
      )}

      <Step
        n={1}
        done={hasProfile}
        title="Claim your artist dossier"
        body={
          !hasProfile ? (
            <form onSubmit={claim} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
                className="h-11 flex-1 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
              />
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="h-11 rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
              >
                {busy ? "Creating..." : "Create dossier"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted">Done.</p>
          )
        }
      />

      <Step
        n={2}
        done={hasStreaming}
        title="Set up streaming"
        body={
          !hasProfile ? (
            <p className="text-sm text-muted">Waiting for step 1.</p>
          ) : hasStreaming ? (
            <p className="text-sm text-muted">Done.</p>
          ) : (
            <div>
              <p className="mb-3 text-sm text-foreground/85">
                Cerberus provisions a named streaming tunnel for your slug. One click, one time.
              </p>
              <button
                type="button"
                onClick={setupStreaming}
                disabled={busy}
                className="rounded-md bg-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
              >
                {busy ? "Setting up..." : "Set up streaming"}
              </button>
            </div>
          )
        }
      />

      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
}

function Step({
  n,
  done,
  title,
  body,
}: {
  n: number;
  done: boolean;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-2 flex items-center gap-3">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
            done ? "border-green bg-green/10 text-green" : "border-border text-muted"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {body}
    </div>
  );
}
