"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { admin } from "@/lib/auth-client";

// Account recovery: change an artist's LOGIN email in place (same user.id), for when
// they lose access to their inbox and can't receive the magic link. In-place is the
// rule that matters — the artist_profile, its tracks, and the connected Agent are
// linked by user.id (not email) and by the agent_key on the profile (not the user),
// so changing email keeps the Agent serving and requires nothing on the client side.
// Use only after the artist proves ownership out-of-band.

export function ChangeUserEmail({ userId, currentEmail }: { userId: string; currentEmail: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setOk("");
    const next = email.trim();
    if (!next) { setError("Enter the new email."); return; }
    if (next.toLowerCase() === (currentEmail ?? "").toLowerCase()) { setError("That is already the email on file."); return; }
    setBusy(true);
    const { error } = await admin.updateUser({ userId, data: { email: next, emailVerified: true } });
    setBusy(false);
    if (error) { setError(error.message || "Could not change email."); return; }
    setOk(`Login email changed to ${next}. They can magic-link in with it now; the Agent stays connected.`);
    setEmail("");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-widest text-muted">Account recovery</div>
      <p className="mb-2 text-xs text-muted">
        Change this artist&apos;s login email in place (keeps their account, tracks, and connected Agent).
        Current: <span className="text-foreground/80">{currentEmail ?? "unknown"}</span>. Use only after they prove ownership.
      </p>
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new email"
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-9 rounded-md bg-red px-4 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Saving..." : "Change email"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red">{error}</p>}
      {ok && <p className="mt-2 text-sm text-green">{ok}</p>}
    </div>
  );
}
