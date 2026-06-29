import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { getDb, genreList, type Artist } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";

export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT a.slug, a.display_name, a.bio, a.city, a.genre_tags, a.photo_url, a.tier
       FROM follows f JOIN artist_profiles a ON a.slug = f.artist_slug
       WHERE f.fan_user_id = ? ORDER BY f.created_at DESC`
    )
    .bind(session.user.id)
    .all<Artist>();
  const artists = results ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Following</h1>
          <span className="text-sm text-muted">{artists.length}</span>
        </div>

        {artists.length === 0 ? (
          <p className="text-sm text-muted">
            You are not following anyone yet.{" "}
            <Link href="/" className="text-red hover:underline">
              Discover artists
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {artists.map((a) => (
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
                  {genreList(a.genre_tags).map((g) => (
                    <span key={g} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                      {g}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
