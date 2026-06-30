import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArtistDossier, getActiveLive } from "@/lib/db";
import { SiteHeader } from "@/components/dossier/SiteHeader";
import { LiveViewer } from "@/components/live/LiveViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArtistDossier(slug);
  return { title: a ? `${a.display_name} — Live — Cerberus Live Studio` : "Live — Cerberus Live Studio" };
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistDossier(slug);
  if (!artist || artist.suspended === 1) notFound();
  const live = await getActiveLive(slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            {artist.display_name}
            {live && (
              <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border border-red/50 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-widest text-red">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" /> Live
              </span>
            )}
          </h1>
          <Link href={`/artist/${slug}`} className="text-sm text-muted transition hover:text-foreground">
            Dossier →
          </Link>
        </div>

        {!live ? (
          <div className="rounded-xl border border-border bg-panel p-10 text-center">
            <p className="text-sm text-muted">{artist.display_name} is not live right now.</p>
          </div>
        ) : live.kind === "event" && live.playback_id ? (
          // Managed event: Cloudflare Stream HLS player (customer-agnostic embed).
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
            <iframe
              src={`https://iframe.cloudflarestream.com/${live.playback_id}`}
              title={`${artist.display_name} live`}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : live.kind === "window" && live.provider_id ? (
          <LiveViewer slug={slug} publisherSessionId={live.provider_id} />
        ) : (
          <div className="rounded-xl border border-border bg-panel p-10 text-center">
            <p className="text-sm text-muted">
              {artist.display_name} is live, but live video streaming is not configured on this deployment yet.
            </p>
          </div>
        )}

        {live?.title && <p className="mt-4 text-sm text-foreground/80">{live.title}</p>}
      </main>
    </>
  );
}
