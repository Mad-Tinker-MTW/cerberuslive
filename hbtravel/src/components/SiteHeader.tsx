"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoLink } from "./Logo";
import { Container } from "./ui";
import { actionNav, mainNav } from "@/config/nav";
import { contact } from "@/config/business";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Concierge bar */}
      <div className="hidden border-b border-white/5 bg-onyx/95 backdrop-blur lg:block">
        <Container className="flex h-9 items-center justify-between gap-6 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.24em] text-smoke">
          <p className="truncate">{contact.hoursShort}</p>
          <div className="flex items-center gap-6">
            <Link href="/my-trips" className="transition-colors hover:text-champagne">
              My Trips
            </Link>
            <a href={contact.phoneHref} className="transition-colors hover:text-champagne">
              {contact.phone}
            </a>
            <a href={`mailto:${contact.reservations}`} className="transition-colors hover:text-champagne">
              {contact.reservations}
            </a>
          </div>
        </Container>
      </div>

      <div
        className={`border-b transition-all duration-500 ${
          scrolled ? "border-gold/15 bg-onyx/92 backdrop-blur-xl" : "border-white/5 bg-onyx/70 backdrop-blur"
        }`}
      >
        <Container className="flex h-20 items-center justify-between gap-6">
          <LogoLink />

          <nav aria-label="Main" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap py-2 text-[0.66rem] uppercase tracking-[0.14em] transition-colors 2xl:text-[0.7rem] 2xl:tracking-[0.18em] ${
                    active ? "text-champagne" : "text-ivory/75 hover:text-champagne"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-gold to-champagne transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/plan-my-trip"
              className="whitespace-nowrap bg-gradient-to-r from-gold-deep via-gold to-champagne px-6 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-onyx transition-all duration-300 hover:brightness-110"
            >
              Plan My Trip
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 border border-gold/30 xl:hidden"
          >
            <span className={`h-px w-5 bg-champagne transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-champagne transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-px w-5 bg-champagne transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </Container>
      </div>

      {/* Mobile / tablet drawer */}
      <div
        className={`overflow-hidden border-b border-gold/15 bg-onyx/98 backdrop-blur-xl transition-[max-height] duration-500 xl:hidden ${
          open ? "max-h-[42rem]" : "max-h-0"
        }`}
      >
        <Container className="py-6">
          <ul className="divide-y divide-white/6">
            {[...mainNav, ...actionNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex flex-col gap-1 py-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-champagne">{item.label}</span>
                  {item.blurb ? <span className="text-xs text-smoke">{item.blurb}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={contact.phoneHref}
            className="mt-6 flex items-center justify-center border border-gold/40 py-3 text-xs uppercase tracking-[0.22em] text-champagne"
          >
            Call {contact.phone}
          </a>
        </Container>
      </div>
    </header>
  );
}
