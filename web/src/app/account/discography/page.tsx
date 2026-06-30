import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authFromContext } from "@/lib/auth";
import { getDb, getDiscography, getTracks } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import {
  DiscographyManager,
  type PersonaInput,
  type ReleaseInput,
  type TrackInput,
} from "@/components/account/DiscographyManager";

export const dynamic = "force-dynamic";

export default async function DiscographyPage() {
  const auth = authFromContext();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const db = getDb();
  const profile = await db
    .prepare("SELECT slug FROM artist_profiles WHERE user_id = ? LIMIT 1")
    .bind(session.user.id)
    .first<{ slug: string }>();
  if (!profile) redirect("/account"); // claim a dossier first

  const slug = profile.slug;
  const [disco, tracks] = await Promise.all([getDiscography(slug), getTracks(slug)]);

  const personas: PersonaInput[] = disco.personas.map((p) => ({
    id: p.id,
    name: p.name,
    kind: p.kind,
    members: p.members,
    bio: p.bio,
    dedication: p.dedication,
    sort: p.sort,
  }));

  const releases: ReleaseInput[] = [
    ...disco.personas.flatMap((p) => p.releases),
    ...disco.directReleases,
  ].map((r) => ({
    id: r.id,
    persona_id: r.persona_id,
    title: r.title,
    kind: r.kind,
    year: r.year,
    cover_url: r.cover_url,
    dedication: r.dedication,
    sort: r.sort,
  }));

  const trackInputs: TrackInput[] = tracks.map((t) => ({
    id: t.id,
    release_id: t.release_id,
    persona_id: t.persona_id,
    title: t.title,
    filename: t.filename,
    duration: t.duration,
    version_label: t.version_label,
    performer: t.performer,
    composer: t.composer,
    track_no: t.track_no,
    is_featured: t.is_featured,
    sort: t.sort,
    media_kind: t.media_kind,
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Discography</h1>
          <Link href="/account" className="text-sm text-muted transition hover:text-foreground">
            &larr; Account
          </Link>
        </div>
        <p className="mb-6 text-sm text-muted">
          Organize your catalog: personas (solo or group), releases (album / EP / single),
          and tracks. Each persona and release carries a dedication, the story behind the
          music. A simple solo artist can skip personas and add releases directly.
        </p>
        <DiscographyManager
          slug={slug}
          personas={personas}
          releases={releases}
          tracks={trackInputs}
        />
      </main>
    </>
  );
}
