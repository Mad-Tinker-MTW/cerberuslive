import Link from "next/link";
import { Button, Card, Container, CTABand, FAQ, SectionHeading, Stat } from "@/components/ui";
import { CompassRose, GridLines, HorizonScene, ShipSilhouette, StepMarker } from "@/components/art";
import QuoteCalculator from "@/components/QuoteCalculator";
import { Monogram } from "@/components/Logo";
import {
  adventures,
  airportLanes,
  brand,
  contact,
  nightlife,
} from "@/config/business";
import {
  credentials,
  cruiseCollections,
  differentiators,
  homeFaq,
  journeySteps,
  testimonials,
  vacationCollections,
} from "@/config/content";
import { formatUSD } from "@/lib/pricing";

const pillars = [
  {
    href: "/cruises",
    title: "Cruises",
    body: "Ocean, river, luxury, expedition, family and group sailings — booked by a specialist, not a search box.",
    meta: "6 collections",
  },
  {
    href: "/vacations",
    title: "Full Travel Services",
    body: "Flights, hotels, resorts, rental cars, packages, tours, attractions, excursions and travel insurance.",
    meta: "Every component",
  },
  {
    href: "/transportation",
    title: "Ground Transportation",
    body: "OKC and DFW transfers, nightlife runs, Saturday adventures, private charters and group movement.",
    meta: "Our own fleet",
  },
  {
    href: "/plan-my-trip",
    title: "Custom Journeys",
    body: "Door-to-door itineraries that combine our transportation with your hosted travel bookings.",
    meta: "One itinerary",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <HorizonScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/85 via-onyx/50 to-onyx" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/35 to-transparent" />
        <Container className="relative flex min-h-[88vh] flex-col justify-center py-24">
          <div className="rise max-w-4xl">
            <p className="eyebrow">{brand.parent}</p>
            <h1 className="display mt-6 text-6xl leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
              Highways. Byways.
              <span className="gold-text shimmer block bg-gradient-to-r from-gold-deep via-champagne to-gold bg-clip-text">
                Open Skies.
              </span>
            </h1>
            <div className="gold-rule my-8 w-32" />
            <p className="lede max-w-2xl text-lg sm:text-xl">
              A full-service luxury travel agency that also operates its own executive ground fleet. We plan the cruise,
              book the resort, and drive you to the terminal — one brand, front door to front door.
            </p>
            <div className="mt-11 flex flex-wrap gap-4">
              <Button href="/cruises">Explore Cruises</Button>
              <Button href="/vacations" variant="outline">
                Plan a Vacation
              </Button>
              <Button href="/transportation" variant="outline">
                Book Transportation
              </Button>
            </div>
            <p className="mt-10 text-[0.68rem] uppercase tracking-[0.3em] text-gold">{brand.promise}</p>
          </div>
        </Container>

        <div className="relative border-t border-white/8 bg-onyx/80 backdrop-blur">
          <Container>
            <dl className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
              <Stat value="2" label="Airport corridors — OKC & DFW" />
              <Stat value="6" label="Cruise collections" />
              <Stat value="24/7" label="Dispatch & traveler support" />
              <Stat value="1" label="Invoice trail, door to door" />
            </dl>
          </Container>
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32">
        <GridLines className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Four pillars"
            title={<>One brand across the whole journey</>}
            lede="Most agencies stop at the booking confirmation. We control the first and last mile, then hand you a single itinerary that covers everything in between."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((p) => (
              <Link key={p.href} href={p.href} className="group">
                <Card className="flex h-full flex-col transition-all duration-500 group-hover:border-gold/45 group-hover:shadow-[0_30px_70px_-40px_rgba(212,175,55,0.55)]">
                  <span className="text-[0.6rem] uppercase tracking-[0.28em] text-gold">{p.meta}</span>
                  <h3 className="display mt-4 text-3xl">{p.title}</h3>
                  <p className="lede mt-4 flex-1 text-sm">{p.body}</p>
                  <span className="mt-6 text-[0.68rem] uppercase tracking-[0.24em] text-champagne transition-transform duration-300 group-hover:translate-x-1">
                    Explore →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Cruise collections ───────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/6 bg-gradient-to-b from-midnight-deep via-onyx to-onyx py-24 sm:py-32">
        <ShipSilhouette className="pointer-events-none absolute -right-20 bottom-0 w-[46rem] opacity-25" />
        <Container className="relative">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              eyebrow="Cruising, as a specialty"
              title="Six ways to sail"
              lede="Cruise is a first-class category here, not an add-on. We hold group space, watch price drops after deposit and put every supplier term in writing."
            />
            <Button href="/cruises" variant="outline">
              All cruise collections
            </Button>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cruiseCollections.map((c) => (
              <Card key={c.slug} className="flex h-full flex-col">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="display text-3xl">{c.name}</h3>
                  <span className="text-[0.6rem] uppercase tracking-[0.24em] text-smoke">{c.meta}</span>
                </div>
                <div className="gold-rule my-5 w-14" />
                <p className="lede flex-1 text-sm">{c.blurb}</p>
                <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-champagne">From {c.from}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Transportation + calculator ──────────────────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="Regional executive transportation"
                title="The fleet is ours. So is the accountability."
                lede="Published fares, professional drivers and dispatch that tracks your inbound flight. Airport pricing is per separate travel party — never a per-head surprise at the curb."
              />

              <div className="mt-12 space-y-4">
                {airportLanes.map((lane) => (
                  <div
                    key={lane.id}
                    className="flex flex-wrap items-center justify-between gap-4 border border-white/8 bg-onyx-raised/60 px-6 py-5"
                  >
                    <div>
                      <p className="display text-2xl">
                        {lane.from} <span className="text-gold">→</span> {lane.airportCode}
                      </p>
                      <p className="mt-1 text-xs text-smoke">
                        {lane.driveTime} · up to {lane.includedPassengers} passengers per travel party
                      </p>
                    </div>
                    <p className="display gold-text text-3xl">{formatUSD(lane.partyFare)}</p>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-4 border border-white/8 bg-onyx-raised/60 px-6 py-5">
                  <div>
                    <p className="display text-2xl">{nightlife.title}</p>
                    <p className="mt-1 text-xs text-smoke">
                      {nightlife.route} · +{formatUSD(nightlife.additionalPassengerFare)} per guest past{" "}
                      {nightlife.includedPassengers}
                    </p>
                  </div>
                  <p className="display gold-text text-3xl">{formatUSD(nightlife.baseFare)}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border border-white/8 bg-onyx-raised/60 px-6 py-5">
                  <div>
                    <p className="display text-2xl">Saturday Adventures</p>
                    <p className="mt-1 text-xs text-smoke">
                      {adventures.cadence} · {adventures.destinations.map((d) => d.name).join(" · ")}
                    </p>
                  </div>
                  <p className="display gold-text text-3xl">{formatUSD(adventures.perPassengerFare)}</p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/transportation">Transportation details</Button>
                <Button href="/plan-my-trip?kind=transportation" variant="outline">
                  Request a charter quote
                </Button>
              </div>
            </div>

            <QuoteCalculator />
          </div>
        </Container>
      </section>

      {/* ── Journey ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/6 bg-gradient-to-b from-onyx via-midnight-deep to-onyx py-24 sm:py-32">
        <CompassRose className="pointer-events-none absolute -left-24 top-16 opacity-15" size={420} />
        <Container className="relative">
          <SectionHeading
            eyebrow="Front door to front door"
            title="What one journey looks like"
            lede="Altus pickup to DFW, a pre-cruise hotel, the sailing itself, excursions, the flight home and a driver waiting at baggage claim. You see one organized journey; we track every provider behind it."
          />
          <ol className="mt-14 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {journeySteps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <StepMarker n={i + 1} />
                <div className="border-b border-white/8 pb-6">
                  <h3 className="display text-2xl">{step.title}</h3>
                  <p className="lede mt-2 text-sm">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── Why us ──────────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <Monogram size={92} />
              <SectionHeading
                className="mt-8"
                eyebrow="Why Highways & Byways"
                title="A travel company that owns the road"
                lede="We are not a shuttle service with a travel page. We are a full-service agency that happens to control its own regional fleet — which is why nothing gets dropped between the booking and the curb."
              />
              <div className="mt-10 grid grid-cols-2 gap-3">
                {credentials.map((c) => (
                  <p key={c} className="border border-white/8 px-4 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-smoke">
                    {c}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {differentiators.map((d) => (
                <Card key={d.title}>
                  <h3 className="display text-2xl text-champagne">{d.title}</h3>
                  <p className="lede mt-3 text-sm">{d.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Vacations strip ─────────────────────────────────── */}
      <section className="border-y border-white/6 bg-onyx-raised/40 py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Beyond the ship"
            title="Vacations, resorts and everything between"
            lede="Air, hotels, rental cars, packages, tours, attractions, excursions and travel insurance — fulfilled through our supplier network, delivered as a single Highways & Byways itinerary."
            align="center"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {vacationCollections.map((v) => (
              <Card key={v.slug} className="flex h-full flex-col">
                <span className="text-[0.6rem] uppercase tracking-[0.26em] text-gold">{v.meta}</span>
                <h3 className="display mt-4 text-2xl">{v.name}</h3>
                <p className="lede mt-3 flex-1 text-sm">{v.blurb}</p>
                <p className="mt-5 text-[0.7rem] uppercase tracking-[0.2em] text-champagne">From {v.from}</p>
              </Card>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button href="/vacations">Browse vacations</Button>
          </div>
        </Container>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow="Travelers" title="Booked, driven, delivered" align="center" />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="flex h-full flex-col">
                <span className="display text-5xl leading-none text-gold/50">&ldquo;</span>
                <p className="lede mt-4 flex-1 text-sm italic">{t.quote}</p>
                <div className="mt-6 border-t border-white/8 pt-4">
                  <p className="text-sm text-champagne">{t.name}</p>
                  <p className="text-xs text-smoke">{t.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeading eyebrow="Questions" title="Before you book" lede={`Anything not covered here, call ${contact.phone}.`} />
            <FAQ items={homeFaq} />
          </div>
        </Container>
      </section>

      <CTABand
        title="Tell us where you're headed"
        lede="Share the destination, the dates and who's traveling. An advisor answers within one business day with a written plan — supplier terms attached."
        primary={{ href: "/plan-my-trip", label: "Plan my trip" }}
        secondary={{ href: "/contact", label: "Talk to an advisor" }}
      />
    </>
  );
}
