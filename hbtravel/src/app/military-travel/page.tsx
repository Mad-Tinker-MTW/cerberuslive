import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { CompassRose } from "@/components/art";
import { Button, Card, Container, CTABand, FAQ, PageHero, SectionHeading } from "@/components/ui";
import { airportLanes, baggagePolicy } from "@/config/business";
import { formatUSD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Military Travel",
  description:
    "Travel planning built around orders: PCS windows, R&R timing, unit movements and Altus AFB airport transfers with military baggage handling.",
};

const services = [
  {
    title: "Orders & PCS",
    body: "Report-no-later-than dates drive the plan. We build around the window, not the other way around, and keep the itinerary flexible where orders can shift.",
  },
  {
    title: "R&R and block leave",
    body: "Short windows, hard stops and a family that has been waiting. Cruises and all-inclusives that fit inside a real leave block.",
  },
  {
    title: "Unit movements",
    body: "Group transportation for details, ceremonies, funerals and training moves, with the cargo trailer for gear and a single invoice for the unit.",
  },
  {
    title: "Retirement & separation travel",
    body: "The trip you have been deferring for twenty years, planned by someone who understands what the last week of out-processing looks like.",
  },
];

const faq = [
  {
    q: "How is military baggage handled?",
    a: baggagePolicy.military,
  },
  {
    q: "Can you invoice a unit or organization?",
    a: "Yes. Group charters and unit movements can be invoiced to the organization with a single billing contact, a rider manifest and written terms.",
  },
  {
    q: "What if my orders change after I book?",
    a: "Tell us early. Transportation moves without penalty outside 48 hours, and we work supplier change policies aggressively when travel is tied to orders.",
  },
  {
    q: "Do you offer military rates?",
    a: "Where suppliers publish military or government rates we source them and show you the comparison. On our own transportation we hold published fares and prioritize AFB pickups on early departures.",
  },
];

export default function MilitaryPage() {
  return (
    <>
      <PageHero
        eyebrow="Altus AFB neighbors"
        title="Travel that respects the mission calendar"
        lede="We plan around report dates, leave blocks and orders that move. Ground transportation from Altus AFB to OKC and DFW runs on our own vehicles, with baggage handling consistent with the operating airline's authorized military allowance."
      >
        <div className="flex flex-wrap gap-4">
          <Button href="/plan-my-trip?kind=military">Plan military travel</Button>
          <Button href="/transportation" variant="outline">
            Base transfer fares
          </Button>
        </div>
      </PageHero>

      <section className="relative overflow-hidden py-24">
        <CompassRose className="pointer-events-none absolute -right-32 top-16 opacity-10" size={440} />
        <Container className="relative">
          <SectionHeading eyebrow="What we handle" title="Four kinds of military travel" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <Card key={s.title}>
                <h3 className="display text-2xl text-champagne">{s.title}</h3>
                <p className="lede mt-3 text-sm">{s.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/6 bg-onyx-raised/40 py-24">
        <Container>
          <SectionHeading eyebrow="From the gate" title="Base transfers" align="center" lede="Published per-party fares from Altus and Altus AFB. Early departures get priority scheduling." />
          <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2">
            {airportLanes.map((lane) => (
              <div key={lane.id} className="border border-white/8 bg-onyx-raised/60 px-6 py-6 text-center">
                <p className="display text-3xl">{lane.airportCode}</p>
                <p className="mt-2 text-xs text-smoke">{lane.to}</p>
                <p className="display gold-text mt-4 text-4xl">{formatUSD(lane.partyFare)}</p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-smoke">
                  per travel party · up to {lane.includedPassengers}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Questions" title="Orders, baggage and billing" />
              <div className="mt-10">
                <FAQ items={faq} />
              </div>
            </div>
            <InquiryForm defaultKind="military" source="/military-travel" heading="Military travel request" />
          </div>
        </Container>
      </section>

      <CTABand
        title="Orders in hand?"
        lede="Send the window and the party. We'll build the travel around the mission and keep it moving when the dates change."
        primary={{ href: "/plan-my-trip?kind=military", label: "Start the request" }}
        secondary={{ href: "/contact", label: "Call us" }}
      />
    </>
  );
}
