import type { Track, MediaCtx } from "@/lib/db";
import { trackUrl } from "@/lib/db";

// Video lane (L-048): performance clips and DJ sets. Streamed through the same media
// gateway as audio (Range-served), rendered with a native video player.
export function VideoList({
  videos,
  mediaCtx,
}: {
  videos: Track[];
  mediaCtx: MediaCtx;
}) {
  const playable = videos
    .map((t) => ({ t, src: trackUrl(mediaCtx, t) }))
    .filter((x): x is { t: Track; src: string } => Boolean(x.src));

  if (playable.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-panel p-10 text-center">
        <p className="text-sm text-muted">
          No video yet. Sets and clips appear once the artist&apos;s media is connected.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {playable.map(({ t, src }) => (
        <div key={t.id} className="rounded-xl border border-border bg-panel p-3">
          <video src={src} controls preload="metadata" className="w-full rounded-md border border-border bg-black" />
          <p className="mt-2 text-sm font-medium text-foreground">{t.title}</p>
          {t.play_count > 0 && (
            <p className="text-xs text-muted">{t.play_count.toLocaleString()} plays</p>
          )}
        </div>
      ))}
    </div>
  );
}
