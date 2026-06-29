"use client";

import { useState } from "react";

// Lets an artist set up first-party media streaming: provision a named Cerberus tunnel
// (one click, Cerberus does the Cloudflare work), generate the agent key, and copy the agent
// config. Media stays on the artist's machine; Cerberus streams it through the media gateway
// (R2-cached) so hot tracks survive the machine being offline.
export function AgentConnect({
  slug,
  tunnelUrl,
  mediaOrigin,
}: {
  slug: string;
  tunnelUrl: string | null;
  mediaOrigin: string | null;
}) {
  const [key, setKey] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(mediaOrigin);
  const [keyBusy, setKeyBusy] = useState(false);
  const [provBusy, setProvBusy] = useState(false);
  const [error, setError] = useState("");

  async function generateKey() {
    setKeyBusy(true);
    setError("");
    const res = await fetch("/api/agent/key", { method: "POST" });
    if (res.ok) {
      setKey(((await res.json()) as { key: string }).key);
    } else {
      setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Could not generate a key.");
    }
    setKeyBusy(false);
  }

  async function setupStreaming() {
    setProvBusy(true);
    setError("");
    const res = await fetch("/api/agent/provision", { method: "POST" });
    if (res.ok) {
      const d = (await res.json()) as { mediaOrigin: string; token: string };
      setOrigin(d.mediaOrigin);
      setToken(d.token);
    } else {
      setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Could not set up streaming.");
    }
    setProvBusy(false);
  }

  const platformUrl = typeof window !== "undefined" ? window.location.origin : "https://cerberuslive.studio";
  const config = JSON.stringify(
    {
      slug,
      agentKey: key ?? "<your-key>",
      musicDir: "C:\\path\\to\\your\\music",
      platformUrl,
      port: 8787,
      ...(token ? { tunnelToken: token } : {}),
    },
    null,
    2
  );

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">Self-host agent</h2>

      {/* Streaming-provisioned status */}
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2 w-2 rounded-full ${origin ? "bg-green" : "bg-muted/50"}`} />
        {origin ? (
          <span className="text-green">Streaming set up</span>
        ) : (
          <span className="text-muted">Streaming not set up yet.</span>
        )}
      </div>
      {/* Live-now status */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2 w-2 rounded-full ${tunnelUrl ? "bg-green" : "bg-muted/50"}`} />
        {tunnelUrl ? (
          <span className="text-green">Agent connected, media live</span>
        ) : (
          <span className="text-muted">Agent not running. Start it to put your media live.</span>
        )}
      </div>

      <p className="mb-4 text-sm text-foreground/85">
        Your media stays on your machine and streams through Cerberus. Set up streaming once,
        generate a key, drop both into the agent config, and run the agent when you want your
        tracks live. Cerberus caches plays so popular tracks keep streaming even when your
        machine is off.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={setupStreaming}
          disabled={provBusy}
          className="rounded-md bg-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {provBusy ? "Setting up..." : origin ? "Show streaming token" : "Set up streaming"}
        </button>
        <button
          type="button"
          onClick={generateKey}
          disabled={keyBusy}
          className="rounded-md border border-border bg-panel-soft px-4 py-2 text-sm font-semibold text-foreground transition hover:border-red disabled:opacity-50"
        >
          {keyBusy ? "Generating..." : key ? "Regenerate agent key" : "Generate agent key"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red">{error}</p>}

      {(key || token) && (
        <div className="mt-4">
          {key && (
            <>
              <p className="mb-1 text-xs uppercase tracking-widest text-muted">Your agent key (copy now)</p>
              <code className="block break-all rounded-md border border-border bg-panel-soft p-3 font-mono text-xs text-foreground">
                {key}
              </code>
            </>
          )}
          {token && (
            <>
              <p className="mb-1 mt-4 text-xs uppercase tracking-widest text-muted">Streaming tunnel token (copy now)</p>
              <code className="block break-all rounded-md border border-border bg-panel-soft p-3 font-mono text-xs text-foreground">
                {token}
              </code>
            </>
          )}
          <p className="mb-1 mt-4 text-xs uppercase tracking-widest text-muted">cerberus-agent.config.json</p>
          <pre className="overflow-x-auto rounded-md border border-border bg-panel-soft p-3 font-mono text-xs text-foreground/85">
{config}
          </pre>
          <p className="mt-2 text-xs text-muted">
            Keep the key and token secret. Regenerating the key invalidates the old one.
          </p>
        </div>
      )}
    </div>
  );
}
