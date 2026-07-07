import type {
  Discography,
  ReleaseWithTracks,
  PersonaWithReleases,
  Track,
} from "@/lib/db";

/**
 * Flat, render-ready view of a discography for the card-grid UI. The DB shape nests
 * releases under personas and keeps loose singles in separate lanes; this collapses all
 * of that into one ordered list of "release cards" while preserving the persona/group and
 * direct/collaboration structure via the fields below. Loose singles (persona-level or
 * artist-direct) become synthetic single-kind cards so nothing drops out of the catalog.
 *
 * Pure and server-safe: the server component computes this so the catalog text (titles,
 * personas, tracklists) is in the initial SSR HTML for SEO. The client shell only filters,
 * searches, and sorts what is already rendered.
 */
export type ReleaseCard = {
  key: string;
  release: ReleaseWithTracks;
  /** Persona display name, or null for the artist's own direct lane. */
  personaName: string | null;
  /** Persona is a multi-member group (drives the Collaborations filter). */
  isCollaboration: boolean;
  /** Persona-scoped release (drives the Personas filter). */
  hasPersona: boolean;
  /** Release-level dedication, falling back to the persona's when the release has none. */
  dedication: string | null;
};

export type FilterId =
  | "all"
  | "albums"
  | "eps"
  | "singles"
  | "personas"
  | "collaborations";

/** Parse a "m:ss" or "h:mm:ss" duration string into seconds. Returns 0 on anything unparseable. */
export function durationToSeconds(d: string | null | undefined): number {
  if (!d) return 0;
  const parts = d.split(":").map((p) => Number(p.trim()));
  if (parts.some((n) => !Number.isFinite(n))) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

/** Format a total number of seconds back to "m:ss" (or "h:mm:ss" past an hour). */
export function secondsToDuration(total: number): string {
  if (!Number.isFinite(total) || total <= 0) return "0:00";
  const s = Math.round(total);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Sum the durations of a release's tracks into a single "m:ss" total. */
export function totalDuration(r: ReleaseWithTracks): string {
  const secs = r.tracks.reduce((acc, t) => acc + durationToSeconds(t.duration), 0);
  return secondsToDuration(secs);
}

/** Wrap a loose single (a track with no release) as a synthetic single-kind release
 *  so it renders as a card alongside real releases. Singles carry no cover in the schema,
 *  so they fall through to the placeholder tile. */
function singleAsRelease(t: Track): ReleaseWithTracks {
  return {
    id: -t.id, // negative id space so it never collides with a real release id
    persona_id: t.persona_id,
    title: t.title,
    kind: "single",
    year: null,
    cover_url: null,
    dedication: null,
    sort: t.sort,
    tracks: [t],
  };
}

/**
 * Flatten a Discography into an ordered list of ReleaseCards. Order mirrors the dossier's
 * existing composition: each persona's releases then persona singles, then the artist's
 * direct releases, then direct singles. Personas and direct-lane items keep their identity
 * so the filter chips (Personas / Collaborations) can partition the same flat list.
 */
export function flattenDiscography(d: Discography): ReleaseCard[] {
  const cards: ReleaseCard[] = [];

  const pushRelease = (
    r: ReleaseWithTracks,
    persona: PersonaWithReleases | null
  ) => {
    cards.push({
      key: `r${r.id}`,
      release: r,
      personaName: persona ? persona.name : null,
      isCollaboration: persona ? persona.kind === "group" : false,
      hasPersona: persona != null,
      dedication: r.dedication ?? persona?.dedication ?? null,
    });
  };

  const pushSingle = (t: Track, persona: PersonaWithReleases | null) => {
    const r = singleAsRelease(t);
    cards.push({
      key: `s${t.id}`,
      release: r,
      personaName: persona ? persona.name : null,
      isCollaboration: persona ? persona.kind === "group" : false,
      hasPersona: persona != null,
      dedication: persona?.dedication ?? null,
    });
  };

  for (const p of d.personas) {
    for (const r of p.releases) pushRelease(r, p);
    for (const t of p.singles) pushSingle(t, p);
  }
  for (const r of d.directReleases) pushRelease(r, null);
  for (const t of d.directSingles) pushSingle(t, null);

  return cards;
}

/** Count cards per filter, for the chip labels. */
export function filterCounts(cards: ReleaseCard[]): Record<FilterId, number> {
  return {
    all: cards.length,
    albums: cards.filter((c) => c.release.kind === "album").length,
    eps: cards.filter((c) => c.release.kind === "ep").length,
    singles: cards.filter((c) => c.release.kind === "single").length,
    personas: cards.filter((c) => c.hasPersona).length,
    collaborations: cards.filter((c) => c.isCollaboration).length,
  };
}

/** Whether a card belongs to a given filter. */
export function matchesFilter(c: ReleaseCard, f: FilterId): boolean {
  switch (f) {
    case "all":
      return true;
    case "albums":
      return c.release.kind === "album";
    case "eps":
      return c.release.kind === "ep";
    case "singles":
      return c.release.kind === "single";
    case "personas":
      return c.hasPersona;
    case "collaborations":
      return c.isCollaboration;
  }
}

export const FILTER_LABELS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "albums", label: "Albums" },
  { id: "eps", label: "EPs" },
  { id: "singles", label: "Singles" },
  { id: "personas", label: "Personas" },
  { id: "collaborations", label: "Collaborations" },
];

const KIND_LABEL: Record<string, string> = {
  album: "Album",
  ep: "EP",
  single: "Single",
};

/** Human label for a release kind. */
export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? "Release";
}
