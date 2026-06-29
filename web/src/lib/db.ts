import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

/** Returns the bound D1 database (binding name DB in wrangler.jsonc). */
export function getDb(): D1Database {
  const { env } = getCloudflareContext();
  return (env as unknown as { DB: D1Database }).DB;
}

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
};

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
  return r?.n ?? 0;
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
      "SELECT id, title, filename, duration, is_featured, sort, source, play_count FROM tracks WHERE artist_slug = ? ORDER BY is_featured DESC, sort, id"
    )
    .bind(slug)
    .all<Track>();
  return results ?? [];
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

export type DossierProfile = {
  featuredTrack?: FeaturedTrack;
  performanceProfile?: PerformanceProfile;
  bestFor?: string[];
  media?: MediaItem[];
  availability?: AvailabilityDay[];
};

const DOSSIER_COLUMNS =
  "slug, display_name, bio, city, genre_tags, photo_url, tier, " +
  "subtitle, dossier_id, artist_class, performance_type, set_length, travel_range, " +
  "availability_status, response_time, member_since, verified, booking_range, clearance, " +
  "signal_status, gate_status, sound_style, booking_email, social_links, profile_json, " +
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
