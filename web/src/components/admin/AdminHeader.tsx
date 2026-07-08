"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

// Minimal control-deck header: brand + Log out only. Replaces the public SiteHeader on
// admin pages (the site nav, "Search artists" box, and hamburger-to-account belong to the
// public site, not the control deck). Logout lives here so it's reachable on every admin
// page without going through /account.
export function AdminHeader() {
  const router = useRouter();

  async function logout() {
    await signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            CERBERUS <span className="text-red">LIVE</span>
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted">
            Control Deck
          </span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm text-muted transition hover:border-red hover:text-red"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
