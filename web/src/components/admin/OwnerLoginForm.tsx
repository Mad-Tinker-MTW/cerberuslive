"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, twoFactor } from "@/lib/auth-client";

// Owner / admin sign-in, served only on the control-deck host. Username + password,
// then an authenticator TOTP second factor when 2FA is enabled. Cloudflare Access
// also gates this host at the edge (Windows Hello / WebAuthn).
export function OwnerLoginForm() {
  const router = useRouter();
  const [stage, setStage] = useState<"password" | "totp">("password");
  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  function done() {
    router.push("/admin");
    router.refresh();
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!uname.trim() || !password) {
      setError("Username and password required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const { data, error } = await signIn.username({ username: uname.trim(), password });
    if (error) {
      setError(error.message || "Invalid username or password.");
      setStatus("error");
    } else if ((data as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
      // 2FA enabled: no session yet, prompt for the authenticator code.
      setStatus("idle");
      setStage("totp");
    } else {
      done();
    }
  }

  async function submitTotp(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter the 6-digit code.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const { error } = await twoFactor.verifyTotp({ code: code.trim() });
    if (error) {
      setError(error.message || "Invalid code.");
      setStatus("error");
    } else {
      done();
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <h1 className="text-lg font-semibold">Control deck</h1>
      <p className="mt-1 text-sm text-muted">
        {stage === "password" ? "Owner sign-in." : "Authenticator code."}
      </p>

      {stage === "password" ? (
        <form onSubmit={submitPassword} className="mt-5 flex flex-col gap-3">
          <input
            id="username"
            name="username"
            type="text"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
            placeholder="username"
            autoComplete="username"
            className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
          />
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
            className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
          >
            {status === "sending" ? "Signing in..." : "Sign in"}
          </button>
          {status === "error" && <p className="text-sm text-red">{error}</p>}
        </form>
      ) : (
        <form onSubmit={submitTotp} className="mt-5 flex flex-col gap-3">
          <input
            id="totp"
            name="totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="h-11 rounded-md border border-border bg-panel-soft px-3 text-center text-lg tracking-[0.3em] outline-none focus:border-red"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
          >
            {status === "sending" ? "Verifying..." : "Verify"}
          </button>
          {status === "error" && <p className="text-sm text-red">{error}</p>}
        </form>
      )}
    </div>
  );
}
