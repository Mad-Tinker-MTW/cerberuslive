import Link from "next/link";
import { LogoLockup } from "./Logo";
import { Container } from "./ui";
import { footerNav } from "@/config/nav";
import { brand, contact, hostPlan } from "@/config/business";

export default function SiteFooter() {
  const plan = hostPlan();
  return (
    <footer className="border-t border-gold/15 bg-gradient-to-b from-onyx to-midnight-deep">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <LogoLockup size={230} />
            <p className="lede mt-6 max-w-sm text-sm">{brand.positioning}</p>
            <p className="mt-6 text-[0.65rem] uppercase tracking-[0.28em] text-gold">{brand.promise}</p>
            <div className="mt-6 space-y-1 text-sm text-smoke">
              <p>
                <a href={contact.phoneHref} className="transition-colors hover:text-champagne">
                  {contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${contact.reservations}`} className="transition-colors hover:text-champagne">
                  {contact.reservations}
                </a>
              </p>
              <p>
                {contact.address.line1}, {contact.address.city}, {contact.address.state} {contact.address.zip}
              </p>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h3 className="text-[0.65rem] uppercase tracking-[0.28em] text-champagne">{group.title}</h3>
                <div className="gold-rule mt-4 w-10" />
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-ivory/70 transition-colors hover:text-champagne">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/8 pt-8">
          <div className="flex flex-col gap-4 text-xs text-smoke sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {brand.founded} {brand.name}. {brand.parent}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/legal/terms" className="transition-colors hover:text-champagne">
                Terms
              </Link>
              <Link href="/legal/privacy" className="transition-colors hover:text-champagne">
                Privacy
              </Link>
              <Link href="/contact" className="transition-colors hover:text-champagne">
                Contact
              </Link>
            </div>
          </div>
          <p className="mt-5 max-w-4xl text-[0.7rem] leading-relaxed text-smoke/70">
            Travel bookings are arranged through {plan.hostAgency}, our host agency partner, and are subject to each
            supplier&apos;s terms, deposit schedules and cancellation policies. Ground transportation is operated
            directly by {brand.shortName}. Fares, routes and schedules shown are current published rates and may be
            adjusted for capacity, seasonality and fuel. Florida Seller of Travel and other state registrations
            available on request.
          </p>
        </div>
      </Container>
    </footer>
  );
}
