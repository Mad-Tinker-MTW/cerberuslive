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
