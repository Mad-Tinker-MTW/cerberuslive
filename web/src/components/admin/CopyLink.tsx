"use client";

import { useState } from "react";

// Copy a URL to the clipboard with brief "Copied!" feedback. Used in the admin to grab
// an artist's public dossier link without navigating away.
export function CopyLink({ url, label = "Copy public link" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (rare on HTTPS). Fall back to a prompt so the link is still grabbable.
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={url}
      className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
