import type {
  Discography,
  ReleaseWithTracks,
  PersonaWithReleases,
  PersonaMember,
  MediaCtx,
  Track,
} from "@/lib/db";
import { trackUrl } from "@/lib/db";
import { AudioPlayer } from "./AudioPlayer";

const KIND_LABEL: Record<string, string> = {
  album: "Album",
  ep: "EP",
  single: "Single",
};

/** The dedication / story field — the differentiator. Shown as an accented callout
 *  next to the music so a release means something instead of being a catalog row. */
function Dedication({ text }: { text: string }) {
  return (
    <blockquote className="mt-3 border-l-2 border-red/60 pl-4 text-sm italic leading-relaxed text-foreground/75">
      {text}
    </blockquote>
  );
}

function TrackRow({ t, src }: { t: Track; src: string | null }) {
  // Group "versions" credit + composer credit, when present.
  const credit = [t.version_label, t.performer].filter(Boolean).join(" · ");
  if (src && t.media_kind === "video") {
    return (
      <div className="rounded-lg border border-border bg-panel-soft p-3">
        <p className="mb-2 text-sm font-medium text-foreground">{t.title}</p>
        <video src={src} controls preload="metadata" className="w-full rounded-md border border-border bg-black" />
        {(credit || t.composer) && (
          <p className="mt-1.5 text-[11px] text-muted">
            {credit}
            {credit && t.composer ? " · " : ""}
            {t.composer ? `Composed by ${t.composer}` : ""}
          </p>
        )}
      </div>
    );
  }
  if (src) {
    return (
      <div className="rounded-lg border border-border bg-panel-soft p-3">
        <AudioPlayer src={src} title={t.title} duration={t.duration ?? undefined} trackId={t.id} />
        {(credit || t.composer) && (
          <p className="mt-1.5 text-[11px] text-muted">
            {credit}
            {credit && t.composer ? " · " : ""}
            {t.composer ? `Composed by ${t.composer}` : ""}
          </p>
        )}
      </div>
    );
  }
  // Catalog-only row (media offline / not connected): show the entry, no player.
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-panel-soft px-3 py-2.5 text-sm">
      <span className="min-w-0">
        {t.track_no != null && <span className="mr-2 text-muted">{t.track_no}.</span>}
        <span className="text-foreground/90">{t.title}</span>
        {credit && <span className="ml-2 text-[11px] text-muted">{credit}</span>}
      </span>
      {t.duration && <span className="shrink-0 text-xs text-muted">{t.duration}</span>}
    </div>
  );
}

function ReleaseBlock({ r, mediaCtx }: { r: ReleaseWithTracks; mediaCtx: MediaCtx }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="flex items-start gap-4">
        {r.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.cover_url}
            alt={`${r.title} cover`}
            className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h4 className="text-base font-semibold text-foreground">{r.title}</h4>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
              {KIND_LABEL[r.kind] ?? "Release"}
            </span>
            {r.year && <span className="text-xs text-muted">{r.year}</span>}
          </div>
          {r.dedication && <Dedication text={r.dedication} />}
        </div>
      </div>
      {r.tracks.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {r.tracks.map((t) => (
            <TrackRow key={t.id} t={t} src={trackUrl(mediaCtx, t)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MembersLine({ members }: { members: PersonaMember[] }) {
  if (members.length === 0) return null;
  return (
    <p className="mt-1 text-xs text-muted">
      {members
        .map((m) => (m.role ? `${m.name} (${m.role})` : m.name))
        .join(" · ")}
    </p>
  );
}

function PersonaBlock({ p, mediaCtx }: { p: PersonaWithReleases; mediaCtx: MediaCtx }) {
  if (p.releases.length === 0 && p.singles.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{p.name}</h3>
          {p.kind === "group" && (
            <span className="rounded-full border border-red/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-red">
              Group
            </span>
          )}
        </div>
        {p.kind === "group" && <MembersLine members={p.members} />}
        {p.bio && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{p.bio}</p>}
        {p.dedication && <Dedication text={p.dedication} />}
      </div>
      <div className="flex flex-col gap-3">
        {p.releases.map((r) => (
          <ReleaseBlock key={r.id} r={r} mediaCtx={mediaCtx} />
        ))}
      </div>
      {p.singles.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase tracking-widest text-muted">Singles</h4>
          {p.singles.map((t) => (
            <TrackRow key={t.id} t={t} src={trackUrl(mediaCtx, t)} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Type-aware discography for the dossier: personas (solo or group) each with their
 * releases and tracks, plus the artist's own "direct" lane (releases + singles with no
 * persona). The dedication/story field renders alongside the music. Tracks play when the
 * artist's media is live; otherwise the catalog still shows (graceful degradation).
 */
export function DiscographyPanel({
  discography,
  mediaCtx,
}: {
  discography: Discography;
  mediaCtx: MediaCtx;
}) {
  const { personas, directReleases, directSingles } = discography;
  const personasWithContent = personas.filter(
    (p) => p.releases.length > 0 || p.singles.length > 0
  );

  return (
    <div className="flex flex-col gap-8">
      {personasWithContent.map((p) => (
        <PersonaBlock key={p.id} p={p} mediaCtx={mediaCtx} />
      ))}

      {directReleases.length > 0 && (
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground">Releases</h3>
          <div className="flex flex-col gap-3">
            {directReleases.map((r) => (
              <ReleaseBlock key={r.id} r={r} mediaCtx={mediaCtx} />
            ))}
          </div>
        </section>
      )}

      {directSingles.length > 0 && (
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold tracking-tight text-foreground">Singles</h3>
          <div className="flex flex-col gap-2">
            {directSingles.map((t) => (
              <TrackRow key={t.id} t={t} src={trackUrl(mediaCtx, t)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
