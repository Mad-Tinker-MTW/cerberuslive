import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cerberuslive.studio"),
  title: "Cerberus Live Studio",
  description:
    "A creator platform for underground artists, DJs, and performers. Profile, media vault, and live booking, all in one place.",
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "Cerberus Live Studio",
    title: "Cerberus Live Studio",
    description:
      "A creator platform for underground artists, DJs, and performers. Profile, media vault, and live booking, all in one place.",
    url: "https://cerberuslive.studio",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cerberus Live Studio",
    description:
      "A creator platform for underground artists, DJs, and performers.",
    images: ["/logo.png"],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Cerberus" },
  icons: {
    icon: [
      { url: "/icon1.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
