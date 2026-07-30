import type { MetadataRoute } from "next";

// Public, indexable routes. Artist dossiers are dynamic and discovered via internal
// links; the marketing + entry pages are listed here for crawlers.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cerberuslive.studio";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/welcome`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
