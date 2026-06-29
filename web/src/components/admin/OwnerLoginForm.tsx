"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

// Owner / admin sign-in, served only on the control-deck host. Username + password
// today; a second factor (authenticator TOTP) layers on once the two-factor plugin
// is wired, and Cloudflare Access gates this host at the edge.
export function OwnerLoginForm() {
  const router = useRouter();
  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uname.trim() || !password) {
      setError("Username and password required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const { error } = await signIn.username({ username: uname.trim(), password });
    if (error) {
      setError(error.message || "Invalid username or password.");
      setStatus("error");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <h1 className="text-lg font-semibold">Control deck</h1>
      <p className="mt-1 text-sm text-muted">Owner sign-in.</p>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
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
    </div>
  );
}
