"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Two-step onboarding after magic-link sign-in: pick a unique handle, then choose a role.
// Fan/Venue finish here (handle only, no download); Artist routes to claim a dossier.

type CheckResp = { available: boolean; reason?: string; suggestions?: string[] };

export function Onboarding({ hasHandle, currentHandle }: { hasHandle: boolean; currentHandle: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<"handle" | "role">(hasHandle ? "role" : "handle");

  // Handle step
  const [handle, setHandle] = useState(currentHandle ?? "");
  const [check, setCheck] = useState<CheckResp | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    setCheck(null);
    const h = handle.trim();
    if (h.length < 3) return;
    setChecking(true);
    debounce.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/handle/check?handle=${encodeURIComponent(h)}`);
        setCheck((await res.json()) as CheckResp);
      } catch {
        setCheck(null);
      }
      setChecking(false);
    }, 350);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [handle]);

  async function saveHandle() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/handle/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: handle.trim() }),
    });
    setBusy(false);
    if (res.ok) setStep("role");
    else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Could not save that handle.");
    }
  }

  async function pickRole(role: "fan" | "venue") {
    setBusy(true);
    setError("");
    const res = await fetch("/api/onboarding/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusy(false);
    if (res.ok) router.push("/"); // fans + venues land on Discover (home)
    else setError("Could not save. Try again.");
  }

  function chooseArtist() {
    // Artist role + dossier ID are minted when they claim a dossier on /account.
    router.push("/account");
  }

  const canSave = handle.trim().length >= 3 && check?.available === true && !busy;

  if (step === "handle") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pick your handle</h1>
          <p className="mt-1 text-sm text-muted">
            One unique name for your account, everywhere. Letters, numbers, . or _ &mdash; no spaces.
          </p>
        </div>
        <div>
          <div className="flex items-center rounded-md border border-border bg-panel-soft focus-within:border-red">
            <span className="pl-3 text-muted">@</span>
            <input
              autoFocus
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="madtinker"
              className="h-11 flex-1 bg-transparent px-2 text-sm outline-none"
            />
          </div>
          <div className="mt-2 min-h-[20px] text-sm">
            {checking && <span className="text-muted">Checking&hellip;</span>}
            {!checking && check?.available && <span className="text-green">@{handle.trim()} is available</span>}
            {!checking && check && !check.available && (
              <span className="text-red">{check.reason}</span>
            )}
          </div>
          {!checking && check && !check.available && check.suggestions && check.suggestions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {check.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHandle(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-red hover:text-foreground"
                >
                  @{s}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red">{error}</p>}
        <button
          type="button"
          disabled={!canSave}
          onClick={saveHandle}
          className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">What brings you here?</h1>
        <p className="mt-1 text-sm text-muted">You can always change or grow into more later.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <RoleCard
          title="Fan"
          desc="Discover artists, follow, comment, and leave reviews."
          onClick={() => pickRole("fan")}
          busy={busy}
        />
        <RoleCard
          title="Artist"
          desc="Host your own music from your PC and get booked. Sets up your dossier."
          onClick={chooseArtist}
          busy={busy}
          accent
        />
        <RoleCard
          title="Venue"
          desc="Book talent and browse the roster. No download needed."
          onClick={() => pickRole("venue")}
          busy={busy}
        />
      </div>
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
}

function RoleCard({ title, desc, onClick, busy, accent }: { title: string; desc: string; onClick: () => void; busy: boolean; accent?: boolean }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition disabled:opacity-50 ${
        accent ? "border-red/50 bg-red/5 hover:border-red" : "border-border bg-panel hover:border-red"
      }`}
    >
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </button>
  );
}
