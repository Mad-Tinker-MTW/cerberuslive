"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

// Public sign-in is magic-link only. The owner / admin login lives on the
// control-deck host (controldeck.cerberuslive.studio) behind Cloudflare Access,
// so the public site advertises no privileged login path.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submitMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const { error } = await signIn.magicLink({ email, callbackURL: "/account" });
    if (error) {
      setError(error.message || "Something went wrong. Try again.");
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-8 text-center text-lg font-bold tracking-tight">
        CERBERUS <span className="text-red">LIVE</span>
      </Link>

      <div className="rounded-xl border border-border bg-panel p-6">
        {status === "sent" ? (
          <div className="text-center">
            <div className="mb-2 text-2xl text-green">&#10003;</div>
            <h1 className="text-lg font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-muted">
              We sent a sign-in link to <span className="text-foreground">{email}</span>.
              It expires in 5 minutes.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted">
              Passwordless. We email you a one-time link, no account setup needed.
            </p>
            <form onSubmit={submitMagic} className="mt-5 flex flex-col gap-3">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
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
          </>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        New here? The same link signs you up and signs you in.
      </p>
    </main>
  );
}
