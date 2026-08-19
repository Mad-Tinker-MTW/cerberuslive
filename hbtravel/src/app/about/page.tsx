import type { Metadata } from "next";
import { LogoLockup } from "@/components/Logo";
import { CompassRose } from "@/components/art";
import { Card, Container, CTABand, Container as C, PageHero, SectionHeading, Stat } from "@/components/ui";
import { brand, hostPlan } from "@/config/business";
import { credentials, differentiators } from "@/config/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Highways & Byways Travel is a full-service luxury travel agency and regional executive transportation operator based in Altus, Oklahoma — an Atlantis Prime Holdings company.",
};

export default function AboutPage() {
  const plan = hostPlan();
  return (
    <>
      <PageHero
        eyebrow={brand.parent}
        title="A travel company that owns the road"
        lede={brand.positioning}
      />

      <section className="py-24">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
            <div className="flex justify-center">
              <LogoLockup size={420} />
            </div>
            <div>
              <SectionHeading eyebrow="Who we are" title="Built in southwest Oklahoma" />
              <div className="lede mt-8 space-y-5 text-sm">
                <p>
                  Highways &amp; Byways Travel was founded on a simple observation: the hardest part of a trip out of{" "}
                  {brand.homeBase} is not the cruise or the resort. It is the two hundred miles between your front door
                  and the terminal — and the moment the plan breaks, somewhere over a time zone, with nobody to call.
                </p>
                <p>
                  So we built both halves. A full-service travel agency staffed by advisors who book cruises, resorts,
                  air, tours and insurance through our host-agency supplier network — and our own executive fleet
                  running the {brand.serviceArea.toLowerCase()}.
                </p>
                <p>
                  One brand, one itinerary, one invoice trail. You see a single organized journey; behind it we track
                  every supplier, every commission and every vehicle separately, so nothing falls through the seam
                  between travel and transportation.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {credentials.map((c) => (
                  <p key={c} className="border border-white/8 px-4 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-smoke">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-y border-white/6 bg-gradient-to-b from-midnight-deep to-onyx py-24">
        <CompassRose className="pointer-events-none absolute -right-36 top-10 opacity-10" size={460} />
        <C className="relative">
          <SectionHeading eyebrow="How we work" title="What makes the model different" align="center" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {differentiators.map((d) => (
              <Card key={d.title}>
                <h3 className="display text-2xl text-champagne">{d.title}</h3>
                <p className="lede mt-3 text-sm">{d.body}</p>
              </Card>
            ))}
          </div>
        </C>
      </section>

      <section className="py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
            <SectionHeading
              eyebrow="Supplier access"
              title="Big-agency inventory, local accountability"
              lede={`Our travel bookings run through ${plan.hostAgency}, our host agency — the infrastructure that opens cruise, hotel, resort, land, car, insurance and air suppliers to us at scale. You never deal with them. You deal with ${brand.shortName}.`}
            />
            <div className="grid grid-cols-2 gap-8 self-center sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Stat value="6" label="Cruise collections" />
              <Stat value="150+" label="Tour cities" />
              <Stat value="2" label="Airport corridors" />
              <Stat value="24/7" label="Dispatch" />
            </div>
          </div>
        </Container>
      </section>

      <CTABand
        title={brand.promise}
        lede="Whether it is a Saturday run to Oklahoma City or a month at sea, the standard is the same."
        primary={{ href: "/plan-my-trip", label: "Plan my trip" }}
        secondary={{ href: "/contact", label: "Contact us" }}
      />
    </>
  );
}
