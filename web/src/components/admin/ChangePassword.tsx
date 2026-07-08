"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/auth-client";

// Self-service password change for the signed-in control-deck admin. Better Auth
// requires the current password (this is NOT how you fix another user's lockout —
// that needs the admin setUserPassword path, since you won't know their password).

const MIN_PW = 8;

export function ChangePassword() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setOk("");
    if (!current) { setError("Enter your current password."); return; }
    if (next.length < MIN_PW) { setError(`New password must be at least ${MIN_PW} characters.`); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next === current) { setError("New password must differ from the current one."); return; }
    setBusy(true);
    const { error } = await changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) { setError(error.message || "Could not change password."); return; }
    setOk("Password changed. Other sessions were signed out.");
    setCurrent(""); setNext(""); setConfirm("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h2 className="mb-3 text-sm font-semibold">Change password</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="current password"
          autoComplete="current-password"
          className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder={`new password (min ${MIN_PW})`}
          autoComplete="new-password"
          className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="confirm new password"
          autoComplete="new-password"
          className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-10 w-fit rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Saving..." : "Change password"}
        </button>
        {error && <p className="text-sm text-red">{error}</p>}
        {ok && <p className="text-sm text-green">{ok}</p>}
      </form>
    </div>
  );
}
