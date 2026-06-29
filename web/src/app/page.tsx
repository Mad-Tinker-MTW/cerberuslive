import { getDb, type Artist } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { DiscoveryGrid } from "@/components/DiscoveryGrid";

export const dynamic = "force-dynamic";

const PILLARS = [
  { title: "Profile", desc: "Your identity, bio, genre, and links." },
  { title: "Media", desc: "Music, clips, and live streaming." },
  { title: "Booking", desc: "Availability, requests, and shows." },
];

export default async function Home() {
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT slug, display_name, bio, city, genre_tags, photo_url, tier FROM artist_profiles ORDER BY display_name"
    )
    .all<Artist>();
  const artists = results ?? [];

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Cerberus Live Studio"
          width={300}
          height={300}
          className="h-auto w-[220px] sm:w-[300px]"
        />
        <div
          aria-hidden
          className="mx-auto mt-2 h-px w-72 bg-gradient-to-b from-red to-transparent"
        />
        <p className="mt-6 max-w-md text-sm leading-loose text-muted">
          Guarding the gates of the underground.
          <br />
          <span className="text-foreground/80">
            Your profile. Your music. Your stage.
          </span>
          <br />
          Built for independent artists, DJs, and performers, not the algorithm.
        </p>
      </section>

      {/* Pillars */}
      <section className="mx-auto mt-12 grid w-full max-w-2xl grid-cols-1 gap-3 px-6 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="relative overflow-hidden rounded-xl border border-border bg-panel p-5 text-center"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-0.5 bg-red/40"
            />
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {p.title}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/60">
              {p.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Discovery */}
      <main className="mx-auto mt-16 w-full max-w-5xl px-6 pb-20">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xs uppercase tracking-widest text-muted">
            Discover Artists
          </h2>
          <span className="text-xs text-muted/60">{artists.length}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {artists.length === 0 ? (
          <p className="text-muted">No artists yet.</p>
        ) : (
          <DiscoveryGrid artists={artists} />
        )}
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs tracking-wide text-muted/70">
        <p>
          &copy; 2026 Cerberus Live Studio &middot;{" "}
          <a
            href="mailto:hello@cerberuslive.studio"
            className="transition hover:text-red"
          >
            hello@cerberuslive.studio
          </a>
        </p>
      </footer>
    </>
  );
}
