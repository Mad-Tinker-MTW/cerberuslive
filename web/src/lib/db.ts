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
};

export type Track = {
  id: number;
  title: string;
  filename: string;
  duration: string | null;
  is_featured: number;
  sort: number;
  source: string;
};

/** Public media URL for a track served through the artist's self-host tunnel. */
export function trackUrl(tunnelUrl: string | null, t: Track): string | null {
  if (t.source === "self") {
    if (!tunnelUrl) return null;
    return `${tunnelUrl.replace(/\/$/, "")}/${encodeURIComponent(t.filename)}`;
  }
  // 'r2' (admin-hosted) filenames are already absolute URLs.
  return t.filename;
}

export async function getTracks(slug: string): Promise<Track[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      "SELECT id, title, filename, duration, is_featured, sort, source FROM tracks WHERE artist_slug = ? ORDER BY is_featured DESC, sort, id"
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
  "signal_status, gate_status, sound_style, booking_email, social_links, profile_json, tunnel_url";

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
