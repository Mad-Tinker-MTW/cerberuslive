import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { authFromContext } from "@/lib/auth";
import {
  getArtistDossier,
  getTracks,
  getFollowerCount,
  isFollowing,
  getApprovedReviews,
  trackUrl,
  mediaCtx as makeMediaCtx,
  parseJson,
  type Socials,
  type DossierProfile,
  type FeaturedTrack,
} from "@/lib/db";
import { FollowButton } from "@/components/dossier/FollowButton";
import { ReviewsPanel } from "@/components/dossier/ReviewsPanel";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { ArtistSidebar } from "@/components/dossier/Sidebar";
import { DossierHero, FeaturedTrackCard } from "@/components/dossier/Hero";
import { ProfileTabs } from "@/components/dossier/Tabs";
import { OverviewPanel } from "@/components/dossier/Overview";
import { MediaList } from "@/components/dossier/MediaList";
import { BookingPanel } from "@/components/dossier/Booking";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArtistDossier(slug);
  if (!a) return { title: "Artist not found — Cerberus Live Studio" };
  const desc =
    a.bio ?? `${a.display_name} on Cerberus Live Studio. ${a.subtitle ?? ""}`.trim();
  return {
    title: `${a.display_name} — Cerberus Live Studio`,
    description: desc,
    openGraph: {
      title: `${a.display_name} — Cerberus Live Studio`,
      description: desc,
      type: "profile",
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistDossier(slug);
  if (!artist || artist.suspended === 1) notFound();

  const socials = parseJson<Socials>(artist.social_links, {});
  const profile = parseJson<DossierProfile>(artist.profile_json, {});

  // Real self-hosted tracks (if the artist's agent is connected) take precedence
  // over the static profile_json featured track.
  const tracks = await getTracks(slug);
  const featuredRow = tracks.find((t) => t.is_featured === 1) ?? tracks[0];
  const mediaCtx = makeMediaCtx(artist);
  const featuredSrc = featuredRow ? trackUrl(mediaCtx, featuredRow) : null;
  // The hidden tunnel origin must never reach the client RSC payload. Scrub it now that the
  // client-safe mediaCtx is built; nothing on the public dossier needs these.
  artist.media_origin = null;
  artist.tunnel_url = null;
  const featuredTrack: FeaturedTrack | undefined = featuredRow
    ? { title: featuredRow.title, artist: artist.display_name, duration: featuredRow.duration ?? undefined }
    : profile.featuredTrack;

  // Follow state (session optional — public page).
  const session = await authFromContext().api.getSession({ headers: await headers() });
  const followerCount = await getFollowerCount(slug);
  const following = session ? await isFollowing(slug, session.user.id) : false;
  const reviews = await getApprovedReviews(slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ArtistSidebar artist={artist} socials={socials} />
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-6">
            <DossierHero artist={artist} />
            <FollowButton
              slug={artist.slug}
              initialFollowing={following}
              initialCount={followerCount}
              signedIn={!!session}
            />
            {featuredTrack && (
              <FeaturedTrackCard track={featuredTrack} src={featuredSrc} trackId={featuredRow?.id} />
            )}
            <ProfileTabs
              overview={
                <OverviewPanel
                  artist={artist}
                  performanceProfile={{
                    // Scalar Quick-Info fields fall through so the card stays complete.
                    setLength: profile.performanceProfile?.setLength ?? artist.set_length ?? undefined,
                    type: profile.performanceProfile?.type ?? artist.performance_type ?? undefined,
                    travel: profile.performanceProfile?.travel ?? artist.travel_range ?? undefined,
                    ...profile.performanceProfile,
                  }}
                  bestFor={profile.bestFor}
                  media={profile.media}
                  traits={profile.traits}
                  signatureSounds={profile.signatureSounds}
                  influences={profile.influences}
                  artistDna={profile.artistDna}
                />
              }
              media={
                tracks.length > 0 ? (
                  <MediaList tracks={tracks} mediaCtx={mediaCtx} />
                ) : undefined
              }
              reviews={<ReviewsPanel slug={artist.slug} reviews={reviews} />}
            />
            <BookingPanel
              slug={artist.slug}
              name={artist.display_name}
              availability={profile.availability}
              bookingsOpen={(artist.gate_status ?? "").toLowerCase() !== "closed"}
            />
          </div>
        </div>
      </main>
    </>
  );
}
