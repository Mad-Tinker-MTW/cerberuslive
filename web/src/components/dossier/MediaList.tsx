import type { Track, MediaCtx } from "@/lib/db";
import { trackUrl } from "@/lib/db";
import { AudioPlayer } from "./AudioPlayer";

// Full track list for the Media tab. First-party audio only, streamed through the media
// gateway (R2-cached over the artist's hidden self-host tunnel) or the admin-hosted tier.
export function MediaList({
  tracks,
  mediaCtx,
}: {
  tracks: Track[];
  mediaCtx: MediaCtx;
}) {
  const playable = tracks
    .map((t) => ({ t, src: trackUrl(mediaCtx, t) }))
    .filter((x): x is { t: Track; src: string } => Boolean(x.src));

  if (playable.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-panel p-10 text-center">
        <p className="text-sm text-muted">
          No media yet. Tracks appear once the artist connects their Cerberus agent.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {playable.map(({ t, src }) => (
        <div key={t.id} className="rounded-xl border border-border bg-panel p-4">
          <AudioPlayer src={src} title={t.title} duration={t.duration ?? undefined} trackId={t.id} />
          {t.play_count > 0 && (
            <p className="mt-2 text-xs text-muted">{t.play_count.toLocaleString()} plays</p>
          )}
        </div>
      ))}
    </div>
  );
}
