"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { admin } from "@/lib/auth-client";

// Control-deck admin lifecycle (Better Auth admin plugin). Two paths:
//  - Create: mint a brand-new standalone admin (email + username + password).
//  - Promote: turn an existing account (fan/artist, magic-link only) into an admin
//    by giving it a role, a password, and a username so it can use the owner login.
// Every new admin still enrolls TOTP on this page and needs their email added to
// the Cloudflare Access allow-list before they can reach this host.

export type AdminRow = { id: string; email: string; username: string | null; name: string | null };

const MIN_PW = 8;

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red"
      />
    </label>
  );
}

export function AdminManager({ admins }: { admins: AdminRow[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "promote">("create");
  const [email, setEmail] = useState("");
  const [uname, setUname] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  function reset() {
    setEmail(""); setUname(""); setName(""); setPassword("");
  }

  function validate(): string | null {
    if (!email.trim()) return "Email is required.";
    if (!uname.trim()) return "Username is required (the owner login is username-based).";
    if (password.length < MIN_PW) return `Password must be at least ${MIN_PW} characters.`;
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); setOk(""); return; }
    setBusy(true); setError(""); setOk("");
    try {
      const usernameData = { username: uname.trim().toLowerCase(), displayUsername: uname.trim() };
      if (mode === "create") {
        const { error } = await admin.createUser({
          email: email.trim(),
          password,
          name: name.trim() || uname.trim(),
          role: "admin",
          data: usernameData,
        });
        if (error) throw new Error(error.message || "Could not create admin.");
        setOk(`Admin created: ${email.trim()}. They can now sign in with username + password, then enroll TOTP below.`);
      } else {
        // Promote an existing account: find it by exact email, then role + password + username.
        const { data, error: listErr } = await admin.listUsers({
          query: { searchField: "email", searchValue: email.trim(), searchOperator: "contains", limit: 50 },
        });
        if (listErr) throw new Error(listErr.message || "Lookup failed.");
        const users = ((data as { users?: { id: string; email: string }[] } | undefined)?.users) ?? [];
        const target = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!target) throw new Error("No account found with that exact email. Create one, or check the address.");
        const r1 = await admin.setRole({ userId: target.id, role: "admin" });
        if (r1.error) throw new Error(r1.error.message || "Could not set role.");
        const r2 = await admin.setUserPassword({ userId: target.id, newPassword: password });
        if (r2.error) throw new Error(r2.error.message || "Could not set password.");
        const r3 = await admin.updateUser({ userId: target.id, data: { ...usernameData, name: name.trim() || uname.trim() } });
        if (r3.error) throw new Error(r3.error.message || "Could not set username.");
        setOk(`Promoted ${email.trim()} to admin with a username + password. They enroll TOTP below and their email must be on the Cloudflare Access allow-list.`);
      }
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-1 flex items-center gap-3">
        <h2 className="text-sm font-semibold">Admins</h2>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
          {admins.length} active
        </span>
      </div>
      <p className="mb-4 text-sm text-muted">
        Mint a new control-deck admin or promote an existing account. After this, the new admin signs in
        with username + password, enrolls TOTP below, and their email must be added to Cloudflare Access.
      </p>

      {admins.length > 0 && (
        <ul className="mb-5 flex flex-col gap-1.5 rounded-md border border-border bg-panel-soft p-3 text-sm">
          {admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-medium text-foreground">{a.name || a.username || "(no name)"}</span>
              <span className="text-muted">{a.email}</span>
              {a.username && <span className="text-xs text-muted">· @{a.username}</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="mb-4 inline-flex rounded-md border border-border p-0.5 text-sm">
        <button
          type="button"
          onClick={() => { setMode("create"); setError(""); setOk(""); }}
          className={`rounded px-3 py-1.5 transition ${mode === "create" ? "bg-red text-white" : "text-muted hover:text-foreground"}`}
        >
          Create new
        </button>
        <button
          type="button"
          onClick={() => { setMode("promote"); setError(""); setOk(""); }}
          className={`rounded px-3 py-1.5 transition ${mode === "promote" ? "bg-red text-white" : "text-muted hover:text-foreground"}`}
        >
          Promote existing
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="person@example.com" />
          <Field label="Username" value={uname} onChange={setUname} placeholder="firstname.lastname" />
          <Field label="Display name" value={name} onChange={setName} placeholder="Francisco De La Paz" />
          <Field label={`Password (min ${MIN_PW})`} value={password} onChange={setPassword} type="password" placeholder="temporary password" />
        </div>
        <p className="text-xs text-muted">
          {mode === "promote"
            ? "Finds an existing account by that exact email and grants it admin + password + username."
            : "Creates a fresh admin account with these credentials."}
        </p>
        <button
          type="submit"
          disabled={busy}
          className="h-10 w-fit rounded-md bg-red px-5 text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {busy ? "Working..." : mode === "create" ? "Create admin" : "Promote to admin"}
        </button>
        {error && <p className="text-sm text-red">{error}</p>}
        {ok && <p className="text-sm text-green">{ok}</p>}
      </form>
    </div>
  );
}
