import type { NextConfig } from "next";

// CSP tuned to what this marketing + booking site actually loads: self only,
// inline styles from Tailwind/next-font, Google Fonts stylesheet + font files.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Preview deploys (PREVIEW=1) additionally ask crawlers to stay away.
const previewHeaders = process.env.PREVIEW
  ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
  : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          ...previewHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
