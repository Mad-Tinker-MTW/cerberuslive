"use client";

import { useState } from "react";

// The final approval screen for /device: signed in + all prereqs met. Artist types
// (or has prefilled) the user_code and clicks Approve. The desktop picks up the
// approval on its next poll.
export function DeviceApproval({
  initialCode,
  initialGrantStatus,
  displayName,
}: {
  initialCode: string;
  initialGrantStatus: string | null;
  displayName: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<"idle" | "sending" | "approved" | "denied" | "error">(
    initialGrantStatus === "approved" ? "approved" : "idle"
  );
  const [error, setError] = useState("");

  async function submit(action: "approve" | "deny") {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 8) {
      setError("Enter the 8-character code from the agent.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await fetch(`/api/auth/device/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_code: trimmed }),
    });
    if (res.ok) {
      setStatus(action === "approve" ? "approved" : "denied");
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        {
          unknown_code: "That code was not found. Check for typos.",
          "grant_approved": "This code was already approved.",
          "grant_denied": "This code was already denied.",
          "grant_consumed": "This code was already used.",
          "grant_expired": "This code has expired. Generate a new one in the agent.",
          needs_profile: "Your dossier is not set up yet.",
          needs_streaming: "Your streaming tunnel is not set up yet.",
        }[data.error ?? ""] ?? data.error ?? "Something went wrong."
      );
      setStatus("error");
    }
  }

  if (status === "approved") {
    return (
      <div className="rounded-xl border border-green/40 bg-panel p-6 text-center">
        <div className="mb-2 text-2xl text-green">&#10003;</div>
        <h2 className="text-lg font-semibold">Agent authorized</h2>
        <p className="mt-2 text-sm text-muted">
          Signed in as <span className="text-foreground">{displayName}</span>. You can close this tab and return to
          the Cerberus Agent window; it will finish setting up in a few seconds.
        </p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-xl border border-border bg-panel p-6 text-center">
        <h2 className="text-lg font-semibold">Request denied</h2>
        <p className="mt-2 text-sm text-muted">The agent will not receive keys. You can close this tab.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <p className="mb-4 text-sm text-foreground/85">
        Type the code shown by your Cerberus Agent. Approving it links the agent to your
        account as <span className="text-foreground">{displayName}</span>.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="WDJB-MJHT"
        maxLength={10}
        className="h-11 w-full rounded-md border border-border bg-panel-soft px-3 text-center font-mono text-lg outline-none focus:border-red"
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => submit("approve")}
          disabled={status === "sending"}
          className="h-11 flex-1 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {status === "sending" ? "Working..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => submit("deny")}
          disabled={status === "sending"}
          className="h-11 rounded-md border border-border bg-panel-soft px-4 text-sm text-muted transition hover:border-red hover:text-foreground disabled:opacity-50"
        >
          Deny
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-sm text-red">{error}</p>}
    </div>
  );
}
