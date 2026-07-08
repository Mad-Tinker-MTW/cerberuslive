import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

/** Returns the bound D1 database (binding name DB in wrangler.jsonc). */
export function getDb(): D1Database {
  const { env } = getCloudflareContext();
  return (env as unknown as { DB: D1Database }).DB;
}

/**
 * SELECT list for the admin control-deck's per-artist metric rows. Aliased `a` =
 * artist_profiles; the subqueries mirror the dossier's live-metric pattern and keep it a
 * single round-trip. Shared by the paged artist API (api/admin/artists) and the page's
 * flagged-artist read so the two never drift. `last_active` is the most recent session
 * touch for the linked user (cheap, approximate).
 */
export const ADMIN_ARTIST_SELECT = `a.slug, a.display_name, a.tier, a.verified, a.gate_status, a.tunnel_url, a.suspended, a.featured,
  (SELECT COUNT(*) FROM tracks t WHERE t.artist_slug = a.slug) AS tracks,
  (SELECT COALESCE(SUM(t.play_count), 0) FROM tracks t WHERE t.artist_slug = a.slug) AS plays,
  (SELECT COUNT(*) FROM follows f WHERE f.artist_slug = a.slug) AS followers,
  (SELECT COUNT(*) FROM reviews r WHERE r.artist_slug = a.slug AND r.status = 'approved') AS reviews,
  (SELECT AVG(r.rating) FROM reviews r WHERE r.artist_slug = a.slug AND r.status = 'approved') AS avg_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.artist_slug = a.slug AND r.status = 'approved' AND r.sentiment = 'negative') AS neg,
  (SELECT COUNT(*) FROM bookings b WHERE b.artist_slug = a.slug AND b.kind = 'booking') AS bookings,
  (SELECT COUNT(*) FROM bookings b WHERE b.artist_slug = a.slug AND b.kind = 'booking' AND b.status = 'pending') AS open_bookings,
  (SELECT COUNT(*) FROM bookings b WHERE b.artist_slug = a.slug AND b.kind = 'booking' AND b.status = 'accepted'
     AND b.event_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*' AND b.event_date >= date('now')) AS upcoming,
  (SELECT MAX(s.updatedAt) FROM session s WHERE s.userId = a.user_id) AS last_active`;

/** Number of neg reviews at which an artist is "flagged" for the Overview. */
export const FLAGGED_NEG_THRESHOLD = 2;

/**
 * Whitelist mapping an admin-table sort key to a safe ORDER BY expression. Only these keys
 * may drive the server-side sort; anything else falls back to display_name (no injection).
 * The numeric keys reference the ADMIN_ARTIST_SELECT aliases.
 */
export const ADMIN_ARTIST_SORT: Record<string, string> = {
  display_name: "a.display_name",
  tracks: "tracks",
  plays: "plays",
  followers: "followers",
  reviews: "reviews",
  bookings: "bookings",
  upcoming: "upcoming",
  last_active: "last_active",
};

/** Page size for the admin artist tables (server-side pagination). */
export const ADMIN_ARTIST_PAGE_SIZE = 50;

export type Artist = {
  slug: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  genre_tags: string | null;
  photo_url: string | null;
  tier: string;
};

export function genreList(tags: string | null): string[] {
  return (tags ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

/** Roles an artist performs (songwriter, producer, dj, singer...), stored comma-separated
 *  like genre_tags. Drives type-aware section composition on the dossier. */
export function rolesList(roles: string | null): string[] {
  return genreList(roles);
}

/** Spoken-word roles, for which the live "Mic mode" audio profile fits better than "Stage mode". */
const SPOKEN_ROLES = new Set(["comedian", "host", "poet", "mc", "speaker", "storyteller", "podcaster"]);

/**
 * Live performance mode from an artist's roles (L-048 Phase B). 'mic' (spoken: mono, light noise
 * suppression) only when EVERY role is spoken-word; any musical role falls to 'stage' (stereo, voice
 * DSP off so music isn't pumped/ducked), the safer default for a music platform.
 */
export function performanceMode(roles: string | null): "stage" | "mic" {
  const list = rolesList(roles).map((r) => r.toLowerCase());
  if (list.length > 0 && list.every((r) => SPOKEN_ROLES.has(r))) return "mic";
  return "stage";
}

/**
 * The rich artist dossier. Every field beyond the core identity is nullable: the
 * page is built to render a 30%-complete profile, hiding any card, row, or badge
 * whose data is absent. Nested blobs (featured track, performance profile, media,
 * availability) live in profile_json; socials live in social_links.
 */
export type ArtistDossier = Artist & {
  bio: string | null;
  subtitle: string | null;
  dossier_id: string | null;
  artist_class: string | null;
  performance_type: string | null;
  set_length: string | null;
  travel_range: string | null;
  availability_status: string | null;
  response_time: string | null;
  member_since: string | null;
  verified: number;
  booking_range: string | null;
  clearance: string | null;
  signal_status: string | null;
  gate_status: string | null;
  sound_style: string | null;
  booking_email: string | null;
  roles: string | null;
  social_links: string | null;
  profile_json: string | null;
  tunnel_url: string | null;
  media_origin: string | null;
  suspended: number;
};

export type Track = {
  id: number;
  title: string;
  filename: string;
  duration: string | null;
  is_featured: number;
  sort: number;
  source: string;
  play_count: number;
  // L-048 discography columns (all nullable; a track with no release_id and no
  // persona_id is a "direct single" in the artist's own lane).
  release_id: number | null;
  persona_id: number | null;
  version_label: string | null;
  performer: string | null;
  composer: string | null;
  track_no: number | null;
  media_kind: string; // 'audio' | 'video'
};

const TRACK_COLUMNS =
  "id, title, filename, duration, is_featured, sort, source, play_count, " +
  "release_id, persona_id, version_label, performer, composer, track_no, media_kind";

/** Where the media gateway lives. The gateway resolves the artist's hidden tunnel origin
 *  and R2-caches, so the public URL is path-based and never exposes the tunnel host. */
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "https://media.cerberuslive.studio").replace(/\/$/, "");

/** Context needed to build a self-hosted track's public URL. Carries only the public slug and
 *  a boolean — NEVER the hidden origin host, since this object is serialized into the client
 *  RSC payload and the origin must never be advertised. Build it with mediaCtx(). */
export type MediaCtx = { slug: string; hasMedia: boolean };

/** Derive the client-safe media context. hasMedia is true once the artist has provisioned a
 *  gateway origin or has an agent connected, so something is cached or live. */
export function mediaCtx(artist: { slug: string; media_origin: string | null; tunnel_url: string | null }): MediaCtx {
  return { slug: artist.slug, hasMedia: Boolean(artist.media_origin || artist.tunnel_url) };
}

/** Public media URL for a track. Self-hosted tracks route through the media gateway
 *  (media.cerberuslive.studio/<slug>/<file>); the gateway serves from its R2 cache when the
 *  artist is offline. Returns null only when the artist has never provisioned nor connected,
 *  so nothing is cached or live — the player stays hidden (graceful degradation). */
export function trackUrl(ctx: MediaCtx, t: Track): string | null {
  if (t.source === "self") {
    if (!ctx.hasMedia) return null;
    return `${MEDIA_BASE}/${encodeURIComponent(ctx.slug)}/${encodeURIComponent(t.filename)}`;
  }
  // 'r2' (admin-hosted) filenames are already absolute URLs.
  return t.filename;
}

export type Review = {
  id: number;
  reviewer_name: string;
  rating: number;
  body: string | null;
  sentiment: string | null;
  status: string;
  created_at: string;
};

export function sentimentFromRating(r: number): "positive" | "neutral" | "negative" {
  if (r >= 4) return "positive";
  if (r === 3) return "neutral";
  return "negative";
}

export async function getApprovedReviews(slug: string): Promise<Review[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT id, reviewer_name, rating, body, sentiment, status, created_at FROM reviews WHERE artist_slug = ? AND status = 'approved' ORDER BY created_at DESC"
    )
    .bind(slug)
    .all<Review>();
  return results ?? [];
}

export async function getFollowerCount(slug: string): Promise<number> {
  const db = getDb();
  const r = await db
    .prepare("SELECT COUNT(*) AS n FROM follows WHERE artist_slug = ?")
    .bind(slug)
    .first<{ n: number }>();
  let intents = 0;
  try {
    // Confirmed deferred-follows (email-only followers) count too.
    const i = await db
      .prepare("SELECT COUNT(*) AS n FROM follow_intents WHERE artist_slug = ? AND status = 'confirmed'")
      .bind(slug)
      .first<{ n: number }>();
    intents = i?.n ?? 0;
  } catch {
    intents = 0;
  }
  return (r?.n ?? 0) + intents;
}

/** Delete unconfirmed follow intents older than 7 days (lazy cleanup, called on intent submit). */
export async function purgeExpiredFollowIntents(): Promise<void> {
  const db = getDb();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .prepare("DELETE FROM follow_intents WHERE status = 'pending' AND created_at < ?")
    .bind(cutoff)
    .run();
}

/** True when the signed-in user owns this artist profile (used to let an artist preview their own
 *  followers-only content and to authorize post create/delete). */
export async function ownsProfile(slug: string, userId: string): Promise<boolean> {
  const db = getDb();
  const r = await db
    .prepare("SELECT 1 AS x FROM artist_profiles WHERE slug = ? AND user_id = ? LIMIT 1")
    .bind(slug, userId)
    .first<{ x: number }>();
  return !!r;
}

// --- Profile feed (L-048 Phase B) ----------------------------------------------------

export type Post = {
  id: number;
  body: string;
  media_url: string | null;
  visibility: "public" | "followers";
  created_at: string;
};

/** Posts for an artist's feed. Public posts are always returned; followers-only posts are included
 *  only when the viewer is a follower or the artist themselves (decided by the caller). */
export async function getPosts(slug: string, includeFollowersOnly: boolean): Promise<Post[]> {
  const db = getDb();
  const sql = includeFollowersOnly
    ? "SELECT id, body, media_url, visibility, created_at FROM posts WHERE artist_slug = ? ORDER BY created_at DESC LIMIT 50"
    : "SELECT id, body, media_url, visibility, created_at FROM posts WHERE artist_slug = ? AND visibility = 'public' ORDER BY created_at DESC LIMIT 50";
  const { results } = await db.prepare(sql).bind(slug).all<Post>();
  return results ?? [];
}

export async function isFollowing(slug: string, userId: string): Promise<boolean> {
  const db = getDb();
  const r = await db
    .prepare("SELECT id FROM follows WHERE artist_slug = ? AND fan_user_id = ? LIMIT 1")
    .bind(slug, userId)
    .first<{ id: number }>();
  return !!r;
}

export async function getTracks(slug: string): Promise<Track[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT ${TRACK_COLUMNS} FROM tracks WHERE artist_slug = ? ORDER BY is_featured DESC, sort, id`
    )
    .bind(slug)
    .all<Track>();
  return results ?? [];
}

// --- Discography (L-048): Artist -> personas -> releases -> tracks --------------------

export type PersonaMember = { name: string; role?: string };

export type Persona = {
  id: number;
  slug: string;
  name: string;
  kind: "solo" | "group";
  members: PersonaMember[];
  bio: string | null;
  dedication: string | null;
  sort: number;
};

export type Release = {
  id: number;
  persona_id: number | null;
  title: string;
  kind: "album" | "ep" | "single";
  year: string | null;
  cover_url: string | null;
  dedication: string | null;
  sort: number;
};

export type ReleaseWithTracks = Release & { tracks: Track[] };
export type PersonaWithReleases = Persona & {
  releases: ReleaseWithTracks[];
  singles: Track[]; // persona-level tracks with no release
};

/** The full discography for a dossier. `directReleases` are releases with no persona
 *  (the artist's own lane); `directSingles` are tracks with no release and no persona.
 *  `hasAny` lets the dossier compose the Discography section only when there is content. */
export type Discography = {
  personas: PersonaWithReleases[];
  directReleases: ReleaseWithTracks[];
  directSingles: Track[];
  hasAny: boolean;
};

type PersonaRow = {
  id: number;
  slug: string;
  name: string;
  kind: string;
  members: string | null;
  bio: string | null;
  dedication: string | null;
  sort: number;
};

type ReleaseRow = {
  id: number;
  persona_id: number | null;
  title: string;
  kind: string;
  year: string | null;
  cover_url: string | null;
  dedication: string | null;
  sort: number;
};

/**
 * Assemble the artist's discography from three flat reads (personas, releases, tracks)
 * grouped in JS — cheaper and clearer than nested SQL on D1. Tracks attach to their
 * release; releases attach to their persona; everything left over is a direct single.
 */
export async function getDiscography(slug: string): Promise<Discography> {
  const db = getDb();
  const [personaRes, releaseRes, trackRes] = await Promise.all([
    db
      .prepare(
        "SELECT id, slug, name, kind, members, bio, dedication, sort FROM personas WHERE artist_slug = ? ORDER BY sort, id"
      )
      .bind(slug)
      .all<PersonaRow>(),
    db
      .prepare(
        "SELECT id, persona_id, title, kind, year, cover_url, dedication, sort FROM releases WHERE artist_slug = ? ORDER BY sort, id"
      )
      .bind(slug)
      .all<ReleaseRow>(),
    db
      .prepare(
        `SELECT ${TRACK_COLUMNS} FROM tracks WHERE artist_slug = ? ORDER BY track_no, sort, id`
      )
      .bind(slug)
      .all<Track>(),
  ]);

  const tracks = trackRes.results ?? [];

  // Bucket tracks: by release, persona-loose singles, else direct singles.
  const tracksByRelease = new Map<number, Track[]>();
  const singlesByPersona = new Map<number, Track[]>();
  const directSingles: Track[] = [];
  for (const t of tracks) {
    if (t.release_id != null) {
      const arr = tracksByRelease.get(t.release_id) ?? [];
      arr.push(t);
      tracksByRelease.set(t.release_id, arr);
    } else if (t.persona_id != null) {
      const arr = singlesByPersona.get(t.persona_id) ?? [];
      arr.push(t);
      singlesByPersona.set(t.persona_id, arr);
    } else {
      directSingles.push(t);
    }
  }

  const toRelease = (r: ReleaseRow): ReleaseWithTracks => ({
    id: r.id,
    persona_id: r.persona_id,
    title: r.title,
    kind: (["album", "ep", "single"].includes(r.kind) ? r.kind : "single") as Release["kind"],
    year: r.year,
    cover_url: r.cover_url,
    dedication: r.dedication,
    sort: r.sort,
    tracks: tracksByRelease.get(r.id) ?? [],
  });

  const releases = (releaseRes.results ?? []).map(toRelease);
  const releasesByPersona = new Map<number, ReleaseWithTracks[]>();
  const directReleases: ReleaseWithTracks[] = [];
  for (const r of releases) {
    if (r.persona_id != null) {
      const arr = releasesByPersona.get(r.persona_id) ?? [];
      arr.push(r);
      releasesByPersona.set(r.persona_id, arr);
    } else {
      directReleases.push(r);
    }
  }

  const personas: PersonaWithReleases[] = (personaRes.results ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    kind: p.kind === "group" ? "group" : "solo",
    members: parseJson<PersonaMember[]>(p.members, []),
    bio: p.bio,
    dedication: p.dedication,
    sort: p.sort,
    releases: releasesByPersona.get(p.id) ?? [],
    singles: singlesByPersona.get(p.id) ?? [],
  }));

  const hasAny =
    personas.some((p) => p.releases.length > 0 || p.singles.length > 0) ||
    directReleases.length > 0 ||
    directSingles.length > 0;

  return { personas, directReleases, directSingles, hasAny };
}

// --- Live sessions (L-048, Phase 6) -------------------------------------------------

/** Live caps by artist tier. Live is the one real cost center (R2 egress is free, the SFU is not),
 *  so the free window stays intimate by design; managed is generous (covered by the fee). A future
 *  paid self-managed+ tier (needs billing) slots between them (~90 min/week, 50 viewers, 1 Mbps). */
export type LiveTierCaps = {
  weeklyMinutes: number | null; // null = unlimited
  sessionMaxMinutes: number;
  viewerCap: number;
  maxBitrateKbps: number;
};
export const LIVE_TIERS: Record<string, LiveTierCaps> = {
  free: { weeklyMinutes: 10, sessionMaxMinutes: 10, viewerCap: 25, maxBitrateKbps: 700 },
  // Self-managed+ ($29.99) — config wired; selling it needs billing (Stripe, Phase 6).
  plus: { weeklyMinutes: 90, sessionMaxMinutes: 60, viewerCap: 50, maxBitrateKbps: 1000 },
  managed: { weeklyMinutes: null, sessionMaxMinutes: 120, viewerCap: 200, maxBitrateKbps: 2500 },
};
export function liveCaps(tier: string | null | undefined): LiveTierCaps {
  return LIVE_TIERS[tier ?? "free"] ?? LIVE_TIERS.free;
}

/** Window-live minutes this artist has used in the last rolling 7 days. Sums each window
 *  session's elapsed time (ended sessions, or up to now if still live). Used to enforce the
 *  free weekly budget at session start. */
export async function getWeeklyLiveMinutes(slug: string): Promise<number> {
  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { results } = await db
    .prepare(
      "SELECT started_at, ended_at FROM live_sessions WHERE artist_slug = ? AND kind = 'window' AND started_at >= ?"
    )
    .bind(slug, weekAgo)
    .all<{ started_at: string; ended_at: string | null }>();
  let mins = 0;
  for (const r of results ?? []) {
    const start = Date.parse(r.started_at);
    const end = r.ended_at ? Date.parse(r.ended_at) : Date.now();
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      mins += (end - start) / 60000;
    }
  }
  return mins;
}

/** How long a viewer heartbeat stays valid. The client beats every ~10s, so 30s tolerates two
 *  missed beats before a viewer's slot is reclaimed. Used by the concurrent-viewer cap (A.6). */
export const VIEWER_STALE_MS = 30_000;

/** Count viewers currently holding a slot on a live session (last_seen within the stale window).
 *  Pass excludeToken on a join check so a viewer re-joining does not count against their own slot. */
export async function countActiveViewers(sessionId: number, excludeToken?: string): Promise<number> {
  const db = getDb();
  const cutoff = new Date(Date.now() - VIEWER_STALE_MS).toISOString();
  const row = excludeToken
    ? await db
        .prepare(
          "SELECT COUNT(*) AS n FROM live_viewers WHERE session_id = ? AND last_seen > ? AND viewer_token != ?"
        )
        .bind(sessionId, cutoff, excludeToken)
        .first<{ n: number }>()
    : await db
        .prepare("SELECT COUNT(*) AS n FROM live_viewers WHERE session_id = ? AND last_seen > ?")
        .bind(sessionId, cutoff)
        .first<{ n: number }>();
  return row?.n ?? 0;
}

export type LiveSession = {
  id: number;
  artist_slug: string;
  kind: "window" | "event";
  status: "live" | "ended";
  title: string | null;
  provider_id: string | null;
  playback_id: string | null;
  viewer_cap: number | null;
  minutes_cap: number | null;
  started_at: string;
  ended_at: string | null;
};

/** The artist's currently-active live session, or null. A free window past its minutes cap
 *  is treated as no-longer-active (the client also auto-ends; this is the server-side guard). */
export async function getActiveLive(slug: string): Promise<LiveSession | null> {
  const db = getDb();
  const s = await db
    .prepare(
      "SELECT id, artist_slug, kind, status, title, provider_id, playback_id, viewer_cap, minutes_cap, started_at, ended_at FROM live_sessions WHERE artist_slug = ? AND status = 'live' ORDER BY id DESC LIMIT 1"
    )
    .bind(slug)
    .first<LiveSession>();
  if (!s) return null;
  if (s.minutes_cap && s.started_at) {
    const elapsedMin = (Date.now() - Date.parse(s.started_at)) / 60000;
    if (Number.isFinite(elapsedMin) && elapsedMin > s.minutes_cap) return null;
  }
  return s;
}

export type Socials = Partial<
  Record<
    "instagram" | "youtube" | "tiktok" | "spotify" | "soundcloud" | "website",
    string
  >
>;

export type FeaturedTrack = { title: string; artist?: string; duration?: string };

export type PerformanceProfile = {
  setLength?: string;
  type?: string;
  crowdFit?: string;
  cleanSet?: string;
  languages?: string;
  stagePresence?: number;
  energy?: string;
  equipment?: string;
  travel?: string;
};

export type MediaItem = { title: string };

export type AvailabilityDay = {
  day: string;
  state: "available" | "booked";
};

/**
 * "Artist DNA" radar axes — a fixed six-spoke stat chart (game character-sheet
 * style) giving a booker an instant visual read on a performer. The keys are the
 * stored shape; labels render on the dossier and the editor. Each value is 0-100.
 */
export const DNA_AXES = [
  { key: "stageEnergy", label: "Stage Energy" },
  { key: "technicalSkill", label: "Technical Skill" },
  { key: "crowdInteraction", label: "Crowd Interaction" },
  { key: "originality", label: "Originality" },
  { key: "versatility", label: "Versatility" },
  { key: "improvisation", label: "Improvisation" },
] as const;

export type DnaAxisKey = (typeof DNA_AXES)[number]["key"];
export type ArtistDna = Partial<Record<DnaAxisKey, number>>;

/** A single quick-scan trait with a 1-5 star rating (e.g. "Mixing": 4). */
export type ArtistTrait = { name: string; rating: number };

export type DossierProfile = {
  featuredTrack?: FeaturedTrack;
  performanceProfile?: PerformanceProfile;
  bestFor?: string[];
  media?: MediaItem[];
  availability?: AvailabilityDay[];
  // L-046 dossier enrichment — all optional, each card hides when empty.
  traits?: ArtistTrait[];
  signatureSounds?: string[];
  influences?: string[];
  artistDna?: ArtistDna;
};

const DOSSIER_COLUMNS =
  "slug, display_name, bio, city, genre_tags, photo_url, tier, " +
  "subtitle, dossier_id, artist_class, performance_type, set_length, travel_range, " +
  "availability_status, response_time, member_since, verified, booking_range, clearance, " +
  "signal_status, gate_status, sound_style, booking_email, roles, social_links, profile_json, " +
  "tunnel_url, media_origin, suspended";

export async function getArtistDossier(
  slug: string
): Promise<ArtistDossier | null> {
  const db = getDb();
  return db
    .prepare(`SELECT ${DOSSIER_COLUMNS} FROM artist_profiles WHERE slug = ?`)
    .bind(slug)
    .first<ArtistDossier>();
}

/** Parse a JSON column, returning a fallback on null/invalid rather than throwing. */
export function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
