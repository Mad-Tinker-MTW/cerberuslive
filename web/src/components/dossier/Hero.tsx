import type { ArtistDossier, FeaturedTrack } from "@/lib/db";
import { genreList } from "@/lib/db";

/** A deterministic fake waveform (static UI in v1, no real audio yet). */
function Waveform() {
  const bars = Array.from({ length: 64 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(i * 0.7) * 60) + ((i * 13) % 20);
    return Math.min(100, h);
  });
  return (
    <div className="flex h-12 items-center gap-0.5">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full ${i < 18 ? "bg-red" : "bg-foreground/20"}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function FeaturedTrackCard({ track }: { track: FeaturedTrack }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <h3 className="mb-4 text-xs uppercase tracking-widest text-muted">
        Featured Track
      </h3>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Play ${track.title}`}
          className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-panel-soft"
        >
          <span className="text-2xl text-red transition group-hover:scale-110">▶</span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{track.title}</p>
          {track.artist && (
            <p className="truncate text-sm text-muted">{track.artist}</p>
          )}
          <div className="mt-2">
            <Waveform />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>0:00</span>
        <span>{track.duration ?? "0:00"}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Spotify", "YouTube", "SoundCloud", "Share"].map((p) => (
          <button
            key={p}
            type="button"
            className="rounded-md border border-border bg-panel-soft px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function DossierTable({ artist }: { artist: ArtistDossier }) {
  const rows: { label: string; value: string | null; good?: boolean }[] = [
    { label: "Class", value: artist.artist_class },
    {
      label: "Signal",
      value: artist.signal_status,
      good: Boolean(artist.signal_status),
    },
    {
      label: "Gate Status",
      value: artist.gate_status,
      good: artist.gate_status?.toLowerCase() === "open",
    },
    { label: "Booking Range", value: artist.booking_range },
    { label: "Clearance", value: artist.clearance },
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
