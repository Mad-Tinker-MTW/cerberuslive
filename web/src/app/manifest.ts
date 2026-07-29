import type { MetadataRoute } from "next";

// Installable PWA (L-048, Phase 4): the phone is a monitor for the platform (stats,
// bookings, messages, playback), not a native app. Next emits /manifest.webmanifest
// and the <link rel="manifest"> from this file.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cerberus Live Studio",
    short_name: "Cerberus",
    description:
      "Guarding the gates of the underground. Artist dossiers, media, and booking.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050505",
    theme_color: "#050505",
    categories: ["music", "entertainment"],
    icons: [
      { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
