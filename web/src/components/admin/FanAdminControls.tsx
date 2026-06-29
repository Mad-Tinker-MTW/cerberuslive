"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["fan", "artist", "venue"] as const;

/** Change a person's account role from their detail page. Admin is granted
 *  deliberately elsewhere, not offered here. */
export function FanAdminControls({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setRole(next: string) {
    if (next === role) return;
    setBusy(true);
    const res = await fetch("/api/admin/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (d.error) alert(d.error);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 text-[10px] uppercase tracking-widest text-muted">Role</span>
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          disabled={busy}
          onClick={() => setRole(r)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            role === r ? "bg-red/20 text-red" : "border border-border text-muted hover:border-red hover:text-foreground"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
