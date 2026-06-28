import Link from "next/link";
import { getDb, genreList, type Artist } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT slug, display_name, bio, city, genre_tags, photo_url, tier FROM artist_profiles ORDER BY display_name"
    )
    .all<Artist>();
  const artists = results ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-14 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          CERBERUS <span className="text-red">LIVE STUDIO</span>
        </h1>
        <p className="mt-4 text-muted">Guarding the gates of the underground.</p>
      </header>

      <section>
        <h2 className="mb-6 text-sm uppercase tracking-widest text-muted">
          Artists
        </h2>
        {artists.length === 0 ? (
          <p className="text-muted">No artists yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {artists.map((a) => (
              <Link
                key={a.slug}
                href={`/artist/${a.slug}`}
                className="block rounded-xl border border-border bg-card p-5 transition hover:border-red"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">{a.display_name}</h3>
                  {a.tier === "managed" && (
                    <span className="rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-xs text-red">
                      Managed
                    </span>
                  )}
                </div>
                {a.city && <p className="mt-1 text-sm text-muted">{a.city}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {genreList(a.genre_tags).map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                {a.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-foreground/70">
                    {a.bio}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
