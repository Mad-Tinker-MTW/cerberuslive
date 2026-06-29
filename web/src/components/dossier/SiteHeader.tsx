import Link from "next/link";

const NAV = [
  { label: "Discover Artists", href: "/" },
  { label: "Live Streams", href: "/#live" },
  { label: "Shows", href: "/#shows" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

/** Sticky top navigation. Search and the notif/user icons are static UI in v1. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            CERBERUS <span className="text-red">LIVE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-sm text-muted transition hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center rounded-md border border-border bg-panel-soft px-3 py-1.5 sm:flex">
            <span className="text-sm text-muted">Search artists...</span>
          </div>
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted transition hover:border-red hover:text-foreground"
          >
            ☰
          </Link>
        </div>
      </div>
    </header>
  );
}
