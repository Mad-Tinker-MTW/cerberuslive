import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/business";

import monogram from "../../public/brand/hb-monogram.png";
import lockup from "../../public/brand/hb-lockup.png";
import wordmark from "../../public/brand/hb-wordmark.png";

/**
 * The Highways & Byways brand mark: the HB monogram cut by a highway running to
 * the horizon. Assets are the approved artwork, background-keyed to transparent
 * so the gold sits on any surface in the palette.
 */
export function Monogram({
  size = 64,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={monogram}
      alt={`${brand.shortName} monogram`}
      width={size}
      height={Math.round((size * monogram.height) / monogram.width)}
      className={className}
      priority={priority}
      sizes={`${size}px`}
    />
  );
}

export function Wordmark({ width = 260, className = "" }: { width?: number; className?: string }) {
  return (
    <Image
      src={wordmark}
      alt={brand.name}
      width={width}
      height={Math.round((width * wordmark.height) / wordmark.width)}
      className={className}
      sizes={`${width}px`}
    />
  );
}

/** Full stacked lockup — monogram over wordmark, as delivered in the brand artwork. */
export function LogoLockup({
  size = 260,
  stacked = true,
  className = "",
  priority = false,
}: {
  size?: number;
  stacked?: boolean;
  className?: string;
  priority?: boolean;
}) {
  if (!stacked) {
    return (
      <span className={`inline-flex items-center gap-4 ${className}`}>
        <Monogram size={Math.round(size * 0.28)} priority={priority} />
        <Wordmark width={Math.round(size * 0.9)} />
      </span>
    );
  }
  return (
    <Image
      src={lockup}
      alt={`${brand.name} — ${brand.tagline}`}
      width={size}
      height={Math.round((size * lockup.height) / lockup.width)}
      className={className}
      priority={priority}
      sizes={`${size}px`}
    />
  );
}

export function LogoLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 ${className}`} aria-label={`${brand.name} home`}>
      <Monogram size={54} priority className="transition-transform duration-500 group-hover:scale-105" />
      <span className="hidden sm:block">
        <Wordmark width={186} />
      </span>
    </Link>
  );
}
