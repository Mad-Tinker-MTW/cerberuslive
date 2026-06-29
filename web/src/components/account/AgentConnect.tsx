"use client";

import { useState } from "react";

// Lets an artist generate the agent key the Cerberus self-host agent uses, and
// shows their current tunnel status. The key is shown once on generation.
export function AgentConnect({
  slug,
  tunnelUrl,
}: {
  slug: string;
  tunnelUrl: string | null;
}) {
  const [key, setKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/agent/key", { method: "POST" });
    if (res.ok) {
      const d = (await res.json()) as { key: string };
      setKey(d.key);
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Could not generate a key.");
    }
    setBusy(false);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "https://cerberuslive.studio";
  const config = JSON.stringify(
    { slug, agentKey: key ?? "<your-key>", musicDir: "C:\\path\\to\\your\\music", platformUrl: origin, port: 8787 },
    null,
    2
  );

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">Self-host agent</h2>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <span
          className={`inline-block h-2 w-2 rounded-full ${tunnelUrl ? "bg-green" : "bg-muted/50"}`}
        />
        {tunnelUrl ? (
          <span className="text-green">
            Connected{" "}
            <span className="break-all text-muted">({tunnelUrl})</span>
          </span>
        ) : (
          <span className="text-muted">Not connected. Run the agent to put your media live.</span>
        )}
      </div>

      <p className="mb-3 text-sm text-foreground/85">
        Your media stays on your machine and streams through Cerberus. Generate a key,
        drop it in the agent config, and keep the agent running while you want your
        tracks live.
      </p>

      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="rounded-md bg-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
      >
        {busy ? "Generating..." : key ? "Regenerate agent key" : "Generate agent key"}
      </button>
      {error && <p className="mt-2 text-sm text-red">{error}</p>}

      {key && (
        <div className="mt-4">
          <p className="mb-1 text-xs uppercase tracking-widest text-muted">Your agent key (copy now)</p>
          <code className="block break-all rounded-md border border-border bg-panel-soft p-3 font-mono text-xs text-foreground">
            {key}
          </code>
          <p className="mb-1 mt-4 text-xs uppercase tracking-widest text-muted">cerberus-agent.config.json</p>
          <pre className="overflow-x-auto rounded-md border border-border bg-panel-soft p-3 font-mono text-xs text-foreground/85">
{config}
          </pre>
          <p className="mt-2 text-xs text-muted">
            Regenerating invalidates the old key. Keep this secret.
          </p>
        </div>
      )}
    </div>
  );
}
