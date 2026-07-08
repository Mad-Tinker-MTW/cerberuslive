import type { ArtistDossier, FeaturedTrack } from "@/lib/db";
import { genreList, artistLabel } from "@/lib/db";
import { AudioPlayer } from "./AudioPlayer";

export function FeaturedTrackCard({
  track,
  src,
  trackId,
}: {
  track: FeaturedTrack;
  src?: string | null;
  trackId?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h3 className="mb-4 text-xs uppercase tracking-widest text-muted">
        Featured Track
      </h3>

      {src ? (
        // Real first-party audio streamed through the artist's tunnel.
        <AudioPlayer
          src={src}
          title={track.title}
          artist={track.artist}
          duration={track.duration}
          trackId={trackId}
        />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-panel-soft text-2xl text-foreground/30">
              ▶
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{track.title}</p>
              {track.artist && (
                <p className="truncate text-sm text-muted">{track.artist}</p>
              )}
              {track.duration && (
                <p className="mt-1 text-xs text-muted">{track.duration}</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Audio goes live once the artist connects their Cerberus agent.
          </p>
        </>
      )}

      {/* On-platform actions only. Media is first-party (self-hosted via the
          artist agent or the admin-hosted R2 tier), never linked off platform.
          License/Remix/Buy land with the offerings model. */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-border bg-panel-soft px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
        >
          Share
        </button>
      </div>
    </div>
  );
}

function DossierTable({ artist }: { artist: ArtistDossier }) {
  // Verification is one concept now, driven by the single `verified` flag (the
  // old signal_status + clearance fields are retired as separate state). Booking
  // standing reads from gate_status, relabeled to plain "Booking".
  const rows: { label: string; value: string | null; good?: boolean }[] = [
    { label: "Class", value: artist.artist_class },
    {
      label: "Verification",
      value: artist.verified === 1 ? "Media Verified" : null,
      good: artist.verified === 1,
    },
    {
      label: "Booking",
      value: artist.gate_status,
      good: artist.gate_status?.toLowerCase() === "open",
    },
    { label: "Booking Range", value: artist.booking_range },
    { label: "Label", value: artistLabel(artist) },
    { label: "Member Since", value: artist.member_since },
  ];
  const present = rows.filter((r) => r.value);
  if (present.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-panel-soft p-5">
      <h3 className="mb-3 text-xs uppercase tracking-widest text-muted">
        Cerberus Dossier
      </h3>
      <dl className="grid grid-cols-1 gap-y-2.5 text-sm sm:grid-cols-2 sm:gap-x-6">
        {present.map((r) => (
          <div key={r.label} className="flex justify-between gap-3">
            <dt className="text-muted">{r.label}</dt>
            <dd
              className={`text-right ${r.good ? "text-green" : "text-foreground"}`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function DossierHero({ artist }: { artist: ArtistDossier }) {
  const genres = genreList(artist.genre_tags);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {artist.display_name}
          </h1>
          {artist.verified === 1 && (
            <span
              aria-label="Verified"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-green/40 bg-green/15 text-sm text-green"
            >
              ✓
            </span>
          )}
        </div>
        {artist.subtitle && (
          <p className="mt-2 text-lg text-muted">{artist.subtitle}</p>
        )}
      </div>

      {(genres.length > 0 || artist.artist_class) && (
        <div className="flex flex-wrap gap-2">
          {artist.artist_class && (
            <span className="rounded-full border border-red/40 bg-red/10 px-3 py-1 text-sm text-red">
              {artist.artist_class}
            </span>
          )}
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

      <DossierTable artist={artist} />
    </section>
  );
}
