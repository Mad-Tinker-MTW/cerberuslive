"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function AccountActions({
  hasProfile,
  defaultName,
}: {
  hasProfile: boolean;
  defaultName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a display name.");
      return;
    }
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

  async function doSignOut() {
    setBusy(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {!hasProfile && (
        <form
          onSubmit={claim}
          className="rounded-xl border border-border bg-panel p-5"
        >
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">
            Claim your artist dossier
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="claim-display-name"
              name="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="h-11 flex-1 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
            />
            <button
              type="submit"
              disabled={busy}
              className="h-11 rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
            >
              {busy ? "Creating..." : "Create dossier"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red">{error}</p>}
        </form>
      )}

      <button
        type="button"
        onClick={doSignOut}
        disabled={busy}
        className="self-start rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-red hover:text-foreground disabled:opacity-50"
      >
        Sign out
      </button>
    </div>
  );
}
