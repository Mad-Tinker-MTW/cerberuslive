import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { brand, contact } from "@/config/business";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.positioning,
  applicationName: brand.name,
  keywords: [
    "luxury travel agency",
    "cruise specialist",
    "Altus Oklahoma travel agency",
    "OKC airport transfer",
    "DFW airport transfer",
    "military travel",
    "private charter transportation",
  ],
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.positioning,
    url: brand.url,
    images: [{ url: "/brand/hb-og.png", width: 1200, height: 630, alt: `${brand.name} — ${brand.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.positioning,
    images: ["/brand/hb-og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  colorScheme: "dark",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: brand.name,
  slogan: brand.promise,
  description: brand.positioning,
  url: brand.url,
  telephone: contact.phone,
  email: contact.reservations,
  parentOrganization: { "@type": "Organization", name: "Atlantis Prime Holdings" },
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.address.line1,
    addressLocality: contact.address.city,
    addressRegion: contact.address.state,
    postalCode: contact.address.zip,
    addressCountry: "US",
  },
  areaServed: brand.serviceArea,
  logo: `${brand.url}/brand/hb-lockup.png`,
  image: `${brand.url}/brand/hb-og.png`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-onyx antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-onyx"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
