"use client";

import { useMemo, useState } from "react";
import type {
  Discography,
  ReleaseWithTracks,
  MediaCtx,
  Track,
} from "@/lib/db";
import { trackUrl } from "@/lib/db";
import {
  PlayerProvider,
  NowPlayingBar,
  usePlayer,
  type PlayerTrack,
} from "./DiscographyPlayer";
import {
  flattenDiscography,
  filterCounts,
  matchesFilter,
  totalDuration,
  kindLabel,
  FILTER_LABELS,
  type ReleaseCard,
  type FilterId,
} from "./discographyModel";

type SortId = "newest" | "oldest";

/** Placeholder cover tile for a release with no cover_url. Never blocks the card;
 *  a tasteful monogram-on-panel stand-in keeps the grid rhythm intact. */
function CoverArt({
  release,
  className,
}: {
  release: ReleaseWithTracks;
  className: string;
}) {
  if (release.cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={release.cover_url}
        alt={`${release.title} cover`}
        className={`${className} object-cover`}
      />
    );
  }
  const initial = release.title.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-panel-soft to-panel text-foreground/25`}
      aria-hidden
    >
      <span className="text-2xl font-bold tracking-tight">{initial}</span>
    </div>
  );
}

/** The dedication / story field — the differentiator. Shown as an accented callout so a
 *  release means something instead of being a catalog row. */
function Dedication({ text }: { text: string }) {
  return (
    <blockquote className="border-l-2 border-red/60 pl-4 text-sm italic leading-relaxed text-foreground/75">
      {text}
    </blockquote>
  );
}

/** "N Tracks · duration · year" meta line shared by the hero, cards, and detail panel. */
function metaBits(card: ReleaseCard): string[] {
  const r = card.release;
  const bits: string[] = [];
  bits.push(`${r.tracks.length} ${r.tracks.length === 1 ? "Track" : "Tracks"}`);
  const dur = totalDuration(r);
  if (dur !== "0:00") bits.push(dur);
  if (r.year) bits.push(r.year);
  return bits;
}

function PlayIcon() {
  return <span aria-hidden>▶</span>;
}

/** The featured-release hero: large cover, label, title, persona, description, a metadata
 *  row, and Play Album + View Details actions. */
function FeaturedHero({
  card,
  onPlay,
  onDetails,
}: {
  card: ReleaseCard;
  onPlay: (card: ReleaseCard) => void;
  onDetails: (card: ReleaseCard) => void;
}) {
  const r = card.release;
  return (
    <div className="rounded-xl border border-border bg-panel p-4 sm:p-5">
      <div className="flex flex-col gap-5 sm:flex-row">
        <CoverArt
          release={r}
          className="h-48 w-full shrink-0 rounded-lg border border-border sm:h-56 sm:w-56"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-red">
              Featured Release
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-muted">
              Latest
            </span>
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {r.title}
          </h3>
          {card.personaName && (
            <p className="mt-1 text-sm text-muted">
              {card.personaName}
              {card.hasPersona ? " (Persona)" : ""}
            </p>
          )}
          {card.dedication && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              {card.dedication}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-widest text-muted">
            <span>{kindLabel(r.kind)}</span>
            {metaBits(card).map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPlay(card)}
              className="inline-flex items-center gap-2 rounded-md bg-red px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-red-dark"
            >
              <PlayIcon /> Play Album
            </button>
            <button
              type="button"
              onClick={() => onDetails(card)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-panel-soft px-4 py-2 text-sm text-foreground transition hover:border-red"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A single release card in the grid: cover, title, persona, meta, Play + View Tracks. */
function ReleaseGridCard({
  card,
  onPlay,
  onDetails,
}: {
  card: ReleaseCard;
  onPlay: (card: ReleaseCard) => void;
  onDetails: (card: ReleaseCard) => void;
}) {
  const r = card.release;
  return (
    <div className="flex flex-col rounded-xl border border-border bg-panel transition hover:border-red/50">
      <CoverArt
        release={r}
        className="aspect-video w-full rounded-t-xl border-b border-border"
      />
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h4 className="truncate text-base font-semibold text-foreground">{r.title}</h4>
        {card.personaName && (
          <p className="truncate text-sm text-muted">{card.personaName}</p>
        )}
        <p className="mt-1 text-xs text-muted">{metaBits(card).join(" · ")}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onPlay(card)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-panel-soft px-3 py-1.5 text-xs text-foreground transition hover:border-red"
          >
            <PlayIcon /> Play
          </button>
          <button
            type="button"
            onClick={() => onDetails(card)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-panel-soft px-3 py-1.5 text-xs text-foreground transition hover:border-red"
          >
            View Tracks
          </button>
        </div>
      </div>
    </div>
  );
}

/** The release detail side panel: cover, meta, About This Release (dedication), a numbered
 *  tracklist with per-track durations, Play Album + Save. */
function DetailPanel({
  card,
  onClose,
  onPlay,
  onPlayTrack,
  mediaCtx,
}: {
  card: ReleaseCard;
  onClose: () => void;
  onPlay: (card: ReleaseCard) => void;
  onPlayTrack: (card: ReleaseCard, index: number) => void;
  mediaCtx: MediaCtx;
}) {
  const r = card.release;
  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-border bg-panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <CoverArt
          release={r}
          className="h-40 w-40 shrink-0 rounded-lg border border-border"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted transition hover:border-red hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">{r.title}</h3>
        {card.personaName && (
          <p className="mt-1 text-sm text-muted">
            {card.personaName}
            {card.hasPersona ? " (Persona)" : ""}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-widest text-muted">
          <span>{kindLabel(r.kind)}</span>
          {metaBits(card).map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPlay(card)}
          className="inline-flex items-center gap-2 rounded-md bg-red px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-red-dark"
        >
          <PlayIcon /> Play Album
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-panel-soft px-4 py-2 text-sm text-foreground transition hover:border-red"
        >
          ♥ Save
        </button>
      </div>

      {card.dedication && (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-widest text-muted">
            About This Release
          </h4>
          <Dedication text={card.dedication} />
        </div>
      )}

      {r.tracks.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-widest text-muted">Tracklist</h4>
          <ol className="flex flex-col">
            {r.tracks.map((t, i) => {
              const playable = trackUrl(mediaCtx, t) != null;
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-b-0"
                >
                  <span className="w-5 shrink-0 text-right text-xs text-muted">
                    {t.track_no ?? i + 1}
                  </span>
                  <button
                    type="button"
                    disabled={!playable}
                    onClick={() => onPlayTrack(card, i)}
                    className="min-w-0 flex-1 truncate text-left text-sm text-foreground/90 transition enabled:hover:text-red disabled:cursor-default"
                    title={playable ? "Play track" : "Audio offline"}
                  >
                    {t.title}
                    {t.version_label && (
                      <span className="ml-2 text-[11px] text-muted">{t.version_label}</span>
                    )}
                  </button>
                  {t.duration && (
                    <span className="shrink-0 text-xs text-muted">{t.duration}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </aside>
  );
}

/** Build a single playable item for the one audio source from a card's track, resolving its
 *  gateway URL. Returns null when the track is not playable (media offline), so callers can
 *  skip it. The cover + persona ride along for the now-playing bar. */
function toPlayerTrack(
  card: ReleaseCard,
  t: Track,
  mediaCtx: MediaCtx
): PlayerTrack | null {
  const src = trackUrl(mediaCtx, t);
  if (src == null) return null;
  const r = card.release;
  return {
    id: t.id,
    src,
    title: t.title,
    persona: card.personaName,
    coverUrl: r.cover_url,
    coverInitial: r.title.trim().charAt(0).toUpperCase() || "?",
    duration: t.duration,
  };
}

/** Build the playable queue for a whole release (Play Album), dropping offline tracks so the
 *  queue never dead-ends on a missing lead track. */
function releaseQueue(card: ReleaseCard, mediaCtx: MediaCtx): PlayerTrack[] {
  return card.release.tracks
    .map((t) => toPlayerTrack(card, t, mediaCtx))
    .filter((pt): pt is PlayerTrack => pt != null);
}

/**
 * Type-aware discography for the dossier, rebuilt to the pinned mockup: a featured-release
 * hero, filter chips (All / Albums / EPs / Singles / Personas / Collaborations), a
 * search + sort row, a release-card grid, a detail side panel, and a sticky now-playing
 * bar. The persona/group and direct/collaboration structure is preserved in the flattened
 * model; the dedication callout stays as the differentiator.
 *
 * Graceful degradation: when the artist's media is offline (trackUrl returns null) the whole
 * catalog still renders — cards, tracklists, dedications — just without live players. The
 * card text is in the initial SSR HTML (this client component is server-rendered for the
 * first paint) so the catalog stays crawlable for SEO.
 */
export function DiscographyPanel({
  discography,
  mediaCtx,
}: {
  discography: Discography;
  mediaCtx: MediaCtx;
}) {
  // PlayerProvider owns the single audio element; every play affordance inside the body
  // routes through it, so two sources can never overlap.
  return (
    <PlayerProvider>
      <DiscographyBody discography={discography} mediaCtx={mediaCtx} />
    </PlayerProvider>
  );
}

function DiscographyBody({
  discography,
  mediaCtx,
}: {
  discography: Discography;
  mediaCtx: MediaCtx;
}) {
  const player = usePlayer();
  const cards = useMemo(() => flattenDiscography(discography), [discography]);
  const counts = useMemo(() => filterCounts(cards), [cards]);

  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("newest");
  const [detailKey, setDetailKey] = useState<string | null>(null);

  const featured = cards[0] ?? null;

  const grid = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = cards.filter(
      (c) =>
        matchesFilter(c, filter) &&
        (q === "" ||
          c.release.title.toLowerCase().includes(q) ||
          (c.personaName ?? "").toLowerCase().includes(q))
    );
    const yearNum = (c: ReleaseCard) => Number(c.release.year) || 0;
    return [...filtered].sort((a, b) =>
      sort === "newest" ? yearNum(b) - yearNum(a) : yearNum(a) - yearNum(b)
    );
  }, [cards, filter, query, sort]);

  const detailCard = detailKey
    ? cards.find((c) => c.key === detailKey) ?? null
    : null;

  /** Play Album: load the release's playable tracks as the queue and start at track 1 (or a
   *  given index). Loads into the ONE audio source, stopping anything already playing. When
   *  nothing is playable (media offline), open details instead of a dead player. */
  function play(card: ReleaseCard, index = 0) {
    const queue = releaseQueue(card, mediaCtx);
    if (queue.length === 0) {
      setDetailKey(card.key);
      return;
    }
    // The queue drops offline tracks, so translate the requested track index to its slot.
    const requested = toPlayerTrack(card, card.release.tracks[index], mediaCtx);
    const start = requested ? queue.findIndex((q) => q.id === requested.id) : 0;
    player.playQueue(queue, start < 0 ? 0 : start);
  }

  /** Play a single track from the detail tracklist into the one source (no queue). */
  function playTrack(card: ReleaseCard, index: number) {
    const pt = toPlayerTrack(card, card.release.tracks[index], mediaCtx);
    if (!pt) return;
    player.play(pt);
  }

  const visibleFilters = FILTER_LABELS.filter((f) => f.id === "all" || counts[f.id] > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* A two-lane layout: catalog on the left, detail panel on the right when open. */}
      <div
        className={
          detailCard
            ? "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
            : "flex flex-col gap-6"
        }
      >
        <div className="flex min-w-0 flex-col gap-6">
          {featured && (
            <FeaturedHero card={featured} onPlay={play} onDetails={(c) => setDetailKey(c.key)} />
          )}

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {visibleFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                  filter === f.id
                    ? "bg-red text-foreground"
                    : "border border-border bg-panel-soft text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search releases..."
              className="min-w-0 flex-1 rounded-md border border-border bg-panel-soft px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-red focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="rounded-md border border-border bg-panel-soft px-3 py-2 text-sm text-foreground focus:border-red focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </label>
          </div>

          {/* Release card grid */}
          {grid.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {grid.map((card) => (
                <ReleaseGridCard
                  key={card.key}
                  card={card}
                  onPlay={play}
                  onDetails={(c) => setDetailKey(c.key)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-panel p-10 text-center">
              <p className="text-sm text-muted">No releases match this filter.</p>
            </div>
          )}
        </div>

        {detailCard && (
          <div className="lg:sticky lg:top-20 lg:self-start">
            <DetailPanel
              card={detailCard}
              onClose={() => setDetailKey(null)}
              onPlay={play}
              onPlayTrack={playTrack}
              mediaCtx={mediaCtx}
            />
          </div>
        )}
      </div>

      {/* The single player UI. Renders nothing when idle. */}
      <NowPlayingBar />
    </div>
  );
}
