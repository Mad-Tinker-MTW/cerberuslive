import type { Metadata } from "next";
import QuoteCalculator from "@/components/QuoteCalculator";
import InquiryForm from "@/components/InquiryForm";
import { GridLines } from "@/components/art";
import { Button, Card, Container, CTABand, FAQ, PageHero, SectionHeading } from "@/components/ui";
import { adventures, airportLanes, baggagePolicy, cancellation, charter, nightlife } from "@/config/business";
import { formatUSD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Transportation",
  description:
    "Executive ground transportation from Altus and Altus AFB: OKC and DFW airport transfers priced per travel party, Bricktown nightlife runs, Saturday adventures and private charter.",
};

const fleet = [
  { title: "Executive van", body: "Up to 5 passengers per travel party with luggage, plus cargo trailer when the group needs it.", meta: "Airport · nightlife · adventures" },
  { title: "Cargo trailer", body: "For unit gear, oversized baggage and multi-family group luggage. Declare at booking so dispatch assigns it.", meta: "By request" },
  { title: "Charter coach partners", body: "When a group outgrows the fleet we place it with a vetted motorcoach partner and keep the file.", meta: "Groups 15+" },
];

const faq = [
  {
    q: "Why is the fare per travel party instead of per person?",
    a: `Each separate travel party books its own fare covering up to ${airportLanes[0].includedPassengers} passengers. Unrelated parties may share the same vehicle on a run — you are never charged for someone else's seat, and one party of two never pays a van's worth of fare.`,
  },
  {
    q: "Can two families share a van to DFW?",
    a: "Yes, and that is common. Each family books its own party fare, each is confirmed separately, and dispatch sequences the pickups.",
  },
  {
    q: "What baggage can I bring?",
    a: `${baggagePolicy.carryOn} ${baggagePolicy.checked} ${baggagePolicy.trailerNote}`,
  },
  {
    q: "What if my flight is delayed or cancelled?",
    a: "Dispatch tracks inbound flights and shifts pickups with the aircraft. On a cancellation we rebook the run; airport transfers cancelled 48+ hours out are refunded in full.",
  },
  {
    q: "Do you serve pickups outside Altus?",
    a: "Regularly. Southwest Oklahoma and North Texas pickups are quoted on the same per-party basis — send the address and we'll price it.",
  },
];

export default function TransportationPage() {
  return (
    <>
      <PageHero
        eyebrow="Regional executive transportation"
        title="Our fleet. Our drivers. Our accountability."
        lede="Published fares, tracked flights and a dispatch line that answers. Airport transfers are priced per separate travel party — never a per-head surprise at the curb."
      >
        <div className="flex flex-wrap gap-4">
          <Button href="#fares">See fares</Button>
          <Button href="/plan-my-trip?kind=transportation" variant="outline">
            Reserve a ride
          </Button>
        </div>
      </PageHero>

      {/* Fares */}
      <section id="fares" className="relative scroll-mt-28 py-24">
        <GridLines className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />
        <Container className="relative">
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <SectionHeading eyebrow="Published fares" title="What it costs" lede="Fares below are current published rates. Capacity, seasonality and fuel can adjust them; your written confirmation is the price." />

              <div id="airport" className="mt-12 scroll-mt-28">
                <h3 className="text-[0.65rem] uppercase tracking-[0.28em] text-gold">Airport transfers</h3>
                <div className="mt-5 space-y-4">
                  {airportLanes.map((lane) => (
                    <div key={lane.id} className="border border-white/8 bg-onyx-raised/60 px-6 py-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <p className="display text-3xl">
                          {lane.from} <span className="text-gold">→</span> {lane.to}
                        </p>
                        <p className="display gold-text text-4xl">{formatUSD(lane.partyFare)}</p>
                      </div>
                      <p className="mt-3 text-sm text-smoke">
                        {lane.airportCode} · {lane.driveTime} · per separate travel party, up to {lane.includedPassengers}{" "}
                        passengers · additional passengers {formatUSD(lane.additionalPassengerFare)} each when capacity
                        allows
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="nightlife" className="mt-12 scroll-mt-28">
                <h3 className="text-[0.65rem] uppercase tracking-[0.28em] text-gold">Nightlife</h3>
                <div className="mt-5 border border-white/8 bg-onyx-raised/60 px-6 py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <p className="display text-3xl">{nightlife.title}</p>
                    <p className="display gold-text text-4xl">{formatUSD(nightlife.baseFare)}</p>
                  </div>
                  <p className="mt-3 text-sm text-smoke">
                    {nightlife.route} · private to your group, up to {nightlife.includedPassengers} passengers ·{" "}
                    {formatUSD(nightlife.additionalPassengerFare)} per additional passenger · {nightlife.window}
                  </p>
                </div>
              </div>

              <div id="adventures" className="mt-12 scroll-mt-28">
                <h3 className="text-[0.65rem] uppercase tracking-[0.28em] text-gold">Saturday adventures</h3>
                <div className="mt-5 border border-white/8 bg-onyx-raised/60 px-6 py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <p className="display text-3xl">{adventures.cadence} to Oklahoma City</p>
                    <p className="display gold-text text-4xl">{formatUSD(adventures.perPassengerFare)}</p>
                  </div>
                  <p className="mt-3 text-sm text-smoke">
                    Per passenger, round trip · {adventures.destinations.map((d) => d.name).join(" · ")} · attraction
                    admission separate
                  </p>
                </div>
              </div>

              <div id="charter" className="mt-12 scroll-mt-28">
                <h3 className="text-[0.65rem] uppercase tracking-[0.28em] text-gold">Private charter</h3>
                <div className="mt-5 border border-white/8 bg-onyx-raised/60 px-6 py-6">
                  <p className="display text-3xl">Quoted to the route</p>
                  <p className="mt-3 text-sm text-smoke">
                    {charter.minimumHours}-hour minimum · {Math.round(charter.depositPercent * 100)}% deposit holds the
                    date · concerts, sports, weddings, casinos, reunions, military groups, corporate transportation and
                    custom destinations.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {charter.occasions.map((o) => (
                      <span key={o} className="border border-white/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-smoke">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-32">
              <QuoteCalculator />
            </div>
          </div>
        </Container>
      </section>

      {/* Fleet + baggage */}
      <section id="baggage" className="scroll-mt-28 border-y border-white/6 bg-gradient-to-b from-midnight-deep to-onyx py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeading eyebrow="Fleet" title="What shows up" />
              <div className="mt-10 space-y-4">
                {fleet.map((f) => (
                  <Card key={f.title}>
                    <span className="text-[0.6rem] uppercase tracking-[0.26em] text-gold">{f.meta}</span>
                    <h3 className="display mt-3 text-2xl">{f.title}</h3>
                    <p className="lede mt-2 text-sm">{f.body}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Baggage & policy" title="The fine print, up front" />
              <ul className="mt-10 space-y-5">
                {[baggagePolicy.carryOn, baggagePolicy.checked, baggagePolicy.military, baggagePolicy.trailerNote].map(
                  (line) => (
                    <li key={line} className="flex gap-4 border-b border-white/8 pb-5 text-sm text-ivory/75">
                      <span className="text-gold">—</span>
                      {line}
                    </li>
                  ),
                )}
                <li className="flex gap-4 border-b border-white/8 pb-5 text-sm text-ivory/75">
                  <span className="text-gold">—</span>
                  {cancellation.transportation}
                </li>
                <li className="flex gap-4 text-sm text-ivory/75">
                  <span className="text-gold">—</span>
                  {cancellation.charter}
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Questions" title="How the rides work" />
              <div className="mt-10">
                <FAQ items={faq} />
              </div>
            </div>
            <InquiryForm defaultKind="transportation" source="/transportation" heading="Reserve your ride" />
          </div>
        </Container>
      </section>

      <CTABand
        title="Need a vehicle this week?"
        lede="Airport runs, a night out, a unit movement or a wedding weekend — send the date and the party and dispatch will confirm."
        primary={{ href: "/plan-my-trip?kind=transportation", label: "Book transportation" }}
        secondary={{ href: "/contact", label: "Call dispatch" }}
      />
    </>
  );
}
