import type { MetadataRoute } from "next";
import { brand } from "@/config/business";
import { mainNav } from "@/config/nav";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...mainNav.map((n) => n.href),
    "/plan-my-trip",
    "/my-trips",
    "/about",
    "/contact",
    "/legal/terms",
    "/legal/privacy",
  ];
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${brand.url}${route}`,
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/plan-my-trip" ? 0.9 : 0.7,
  }));
}
