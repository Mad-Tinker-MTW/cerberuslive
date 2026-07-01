// Download-the-agent block. Sits below AgentConnect on /account. Points at the
// R2-backed installer and explains the device-authorization dance the agent
// walks the artist through on first launch.
export function AgentInstall() {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">Desktop agent</h2>
      <p className="mb-4 text-sm text-foreground/85">
        Install once. On first launch it shows a short code and points you back to
        cerberuslive.studio/device to link your account, then serves your media as long
        as it&apos;s running.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="/api/agent/installer"
          className="rounded-md bg-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-dark"
        >
          Download for Windows
        </a>
        <a
          href="/device"
          className="rounded-md border border-border bg-panel-soft px-4 py-2 text-sm font-semibold text-foreground transition hover:border-red"
        >
          Enter code manually
        </a>
      </div>
    </div>
  );
}
