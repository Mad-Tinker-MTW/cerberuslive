"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

// Signed-out gate for /device. Sends magic-link with callback back to /device?code=<code>
// so the flow lands back on the approval screen with the code prefilled.
export function DeviceLoginPrompt({ initialCode }: { initialCode: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const callback = code ? `/device?code=${encodeURIComponent(code.trim().toUpperCase())}` : "/device";
    const { error } = await signIn.magicLink({ email, callbackURL: callback });
    if (error) {
      setError(error.message || "Something went wrong. Try again.");
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      {status === "sent" ? (
        <div className="text-center">
          <div className="mb-2 text-2xl text-green">&#10003;</div>
          <h1 className="text-lg font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted">
            We sent a sign-in link to <span className="text-foreground">{email}</span>. Open it on
            any device; it will bring you back here with your code intact.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-semibold">Sign in to link your Cerberus Agent</h1>
          <p className="mt-1 text-sm text-muted">
            New here? The same link signs you up. You&apos;ll finish setting up your artist profile
            on the next screen before the agent is authorized.
          </p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Code from the agent (e.g. WDJB-MJHT)"
              maxLength={10}
              className="h-11 rounded-md border border-border bg-panel-soft px-3 font-mono text-sm outline-none focus:border-red"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send sign-in link"}
            </button>
            {status === "error" && <p className="text-sm text-red">{error}</p>}
          </form>
          <p className="mt-4 text-xs text-muted">
            Already signed in on another tab? <Link href="/device" className="text-red hover:underline">Reload</Link>.
          </p>
        </>
      )}
    </div>
  );
}
