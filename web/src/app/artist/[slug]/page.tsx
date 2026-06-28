import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArtistDossier,
  parseJson,
  type Socials,
  type DossierProfile,
} from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { ArtistSidebar } from "@/components/dossier/Sidebar";
import { DossierHero, FeaturedTrackCard } from "@/components/dossier/Hero";
import { ProfileTabs } from "@/components/dossier/Tabs";
import { OverviewPanel } from "@/components/dossier/Overview";
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
  if (!artist) notFound();

  const socials = parseJson<Socials>(artist.social_links, {});
  const profile = parseJson<DossierProfile>(artist.profile_json, {});

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
            {profile.featuredTrack && (
              <FeaturedTrackCard track={profile.featuredTrack} />
            )}
            <ProfileTabs
              overview={
                <OverviewPanel
                  artist={artist}
                  performanceProfile={profile.performanceProfile}
                  bestFor={profile.bestFor}
                  media={profile.media}
                />
              }
            />
            <BookingPanel
              name={artist.display_name}
              bookingEmail={artist.booking_email}
              availability={profile.availability}
            />
          </div>
        </div>
      </main>
    </>
  );
}
