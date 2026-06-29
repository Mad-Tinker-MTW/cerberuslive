"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Artist } from "@/lib/db";

// Client-safe genre split (db.ts is server-only, so don't import from it here).
function genres(tags: string | null): string[] {
  return (tags ?? "").split(",").map((g) => g.trim()).filter(Boolean);
}

export function DiscoveryGrid({ artists }: { artists: Artist[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const a of artists) for (const g of genres(a.genre_tags)) set.add(g);
    return [...set].sort();
  }, [artists]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artists.filter((a) => {
      const gs = genres(a.genre_tags);
      if (genre && !gs.includes(genre)) return false;
      if (!q) return true;
      return (
        a.display_name.toLowerCase().includes(q) ||
        (a.city ?? "").toLowerCase().includes(q) ||
        gs.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [artists, query, genre]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, city, or genre..."
          className="h-11 w-full rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red sm:max-w-xs"
        />
        <span className="text-xs text-muted">{filtered.length} of {artists.length}</span>
      </div>

      {allGenres.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGenre(null)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              genre === null ? "border-red bg-red/10 text-red" : "border-border text-muted hover:border-red"
            }`}
          >
            All
          </button>
          {allGenres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g === genre ? null : g)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                genre === g ? "border-red bg-red/10 text-red" : "border-border text-muted hover:border-red"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No artists match.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((a) => (
            <Link
              key={a.slug}
              href={`/artist/${a.slug}`}
              className="block rounded-xl border border-border bg-panel p-5 transition hover:border-red"
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
                {genres(a.genre_tags).map((g) => (
                  <span key={g} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    {g}
                  </span>
                ))}
              </div>
              {a.bio && <p className="mt-3 line-clamp-2 text-sm text-foreground/70">{a.bio}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
