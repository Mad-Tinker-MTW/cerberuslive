"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { twoFactor } from "@/lib/auth-client";

type EnableData = { totpURI?: string; backupCodes?: string[] };

/** Owner enrollment for authenticator-app TOTP. Enable generates a secret +
 *  backup codes; the owner scans/enters it, then verifies a code to activate. */
export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"idle" | "enrolling">("idle");
  const [uri, setUri] = useState("");
  const [secret, setSecret] = useState("");
  const [backup, setBackup] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function enable() {
    if (!password) { setError("Enter your password."); return; }
    setBusy(true); setError(""); setOk("");
    const { data, error } = await twoFactor.enable({ password });
    setBusy(false);
    if (error) { setError(error.message || "Could not enable."); return; }
    const d = (data ?? {}) as EnableData;
    setUri(d.totpURI ?? "");
    try { setSecret(new URL(d.totpURI ?? "").searchParams.get("secret") ?? ""); } catch { setSecret(""); }
    setBackup(d.backupCodes ?? []);
    setStage("enrolling");
  }

  async function verify() {
    if (!code.trim()) { setError("Enter the 6-digit code."); return; }
    setBusy(true); setError(""); setOk("");
    const { error } = await twoFactor.verifyTotp({ code: code.trim() });
    setBusy(false);
    if (error) { setError(error.message || "Invalid code."); return; }
    setOk("Two-factor is now on. You will be asked for a code at sign-in.");
    setStage("idle"); setPassword(""); setCode("");
    router.refresh();
  }

  async function disable() {
    if (!password) { setError("Enter your password."); return; }
    setBusy(true); setError(""); setOk("");
    const { error } = await twoFactor.disable({ password });
    setBusy(false);
    if (error) { setError(error.message || "Could not disable."); return; }
    setOk("Two-factor disabled.");
    setPassword("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-semibold">Authenticator app (TOTP)</h2>
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${enabled ? "bg-green/20 text-green" : "border border-border text-muted"}`}>
          {enabled ? "On" : "Off"}
        </span>
      </div>

      {stage === "enrolling" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Add this to your authenticator app (scan the URI or enter the secret), then verify a code.
          </p>
          <div className="rounded-md border border-border bg-panel-soft p-3 text-xs">
            <div className="mb-1 text-muted">Secret</div>
            <code className="break-all font-mono text-foreground">{secret || "—"}</code>
            {uri && (
              <>
                <div className="mb-1 mt-3 text-muted">otpauth URI</div>
                <code className="break-all font-mono text-foreground/70">{uri}</code>
              </>
            )}
          </div>
          {backup.length > 0 && (
            <div className="rounded-md border border-red/30 bg-red/5 p-3 text-xs">
              <div className="mb-1 text-red">Backup codes (save these now, shown once)</div>
              <div className="grid grid-cols-2 gap-1 font-mono text-foreground/85 sm:grid-cols-5">
                {backup.map((b) => <span key={b}>{b}</span>)}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="6-digit code" className="h-10 flex-1 rounded-md border border-border bg-panel-soft px-3 text-center tracking-[0.3em] outline-none focus:border-red" />
            <button type="button" disabled={busy} onClick={verify} className="h-10 rounded-md bg-red px-4 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50">Verify & activate</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {enabled ? "Two-factor is on. Enter your password to turn it off." : "Protect the control deck with an authenticator code. Enter your password to begin."}
          </p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red" />
          {enabled ? (
            <button type="button" disabled={busy} onClick={disable} className="h-10 w-fit rounded-md border border-border px-4 text-sm text-muted transition hover:border-red hover:text-red disabled:opacity-50">Disable two-factor</button>
          ) : (
            <button type="button" disabled={busy} onClick={enable} className="h-10 w-fit rounded-md bg-red px-4 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50">Enable two-factor</button>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red">{error}</p>}
      {ok && <p className="mt-3 text-sm text-green">{ok}</p>}
    </div>
  );
}
