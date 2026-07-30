import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

// Per-request so the D1 binding is available to enumerate artist dossiers.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cerberuslive.studio";
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/welcome`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const db = getDb();
    const { results } = await db
      .prepare("SELECT slug FROM artist_profiles WHERE suspended = 0 ORDER BY display_name")
      .all<{ slug: string }>();
    for (const a of results ?? []) {
      routes.push({
        url: `${base}/artist/${a.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // D1 binding unavailable at generation time: ship the static routes only.
  }

  return routes;
}
