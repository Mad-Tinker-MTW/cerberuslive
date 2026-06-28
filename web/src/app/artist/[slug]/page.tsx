import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb, genreList, type Artist } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getArtist(slug: string): Promise<Artist | null> {
  const db = getDb();
  return db
    .prepare(
      "SELECT slug, display_name, bio, city, genre_tags, photo_url, tier FROM artist_profiles WHERE slug = ?"
    )
    .bind(slug)
    .first<Artist>();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArtist(slug);
  if (!a) return { title: "Artist not found — Cerberus Live Studio" };
  return {
    title: `${a.display_name} — Cerberus Live Studio`,
    description: a.bio ?? `${a.display_name} on Cerberus Live Studio.`,
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await getArtist(slug);
  if (!a) notFound();
  const genres = genreList(a.genre_tags);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted transition hover:text-red">
        &larr; Cerberus Live Studio
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {a.display_name}
          </h1>
          {a.tier === "managed" && (
            <span className="rounded-full border border-red/40 bg-red/10 px-2 py-1 text-xs text-red">
              Cerberus Managed
            </span>
          )}
        </div>
        {a.city && <p className="mt-2 text-muted">{a.city}</p>}
      </header>

      {genres.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {a.bio && (
        <p className="mt-8 text-lg leading-relaxed text-foreground/80">{a.bio}</p>
      )}

      <div className="mt-12 rounded-xl border border-border bg-card p-6 text-sm text-muted">
        <p className="font-medium text-foreground">
          Media, live room, and booking coming soon.
        </p>
        <p className="mt-1">
          This artist page is live on the Cerberus platform. Phase 2 adds the
          self-hosted media vault.
        </p>
      </div>
    </main>
  );
}
