import type { Metadata } from "next";
import CollectionGrid from "@/components/CollectionGrid";
import InquiryForm from "@/components/InquiryForm";
import { CompassRose } from "@/components/art";
import { Button, Card, Container, CTABand, PageHero, SectionHeading } from "@/components/ui";
import { experienceCollections } from "@/config/content";
import { adventures } from "@/config/business";
import { formatUSD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Tours & Experiences",
  description:
    "Shore excursions, guided tours, attraction tickets and rare access — plus rotating Saturday adventure runs to Oklahoma City attractions.",
};

export default function ToursPage() {
  return (
    <>
      <PageHero
        eyebrow="Tours, excursions & attractions"
        title="The days you actually remember"
        lede="Port days that get you back aboard on time, guides who are licensed locally, tickets already in hand — and a regional adventure calendar close to home."
      >
        <Button href="/plan-my-trip?kind=experience">Plan an experience</Button>
      </PageHero>

      <section className="py-24">
        <Container>
          <SectionHeading eyebrow="What we arrange" title="Four kinds of access" />
          <div className="mt-14">
            <CollectionGrid items={experienceCollections} />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-y border-white/6 bg-onyx-raised/40 py-24" id="adventures">
        <CompassRose className="pointer-events-none absolute -left-28 bottom-0 opacity-10" size={380} />
        <Container className="relative">
          <SectionHeading
            eyebrow={`${adventures.cadence} from Altus`}
            title="Saturday adventures"
            lede={`Round-trip seats at ${formatUSD(adventures.perPassengerFare)} per passenger on our own vehicles. Attraction admission is purchased separately unless your advisor packages it.`}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {adventures.destinations.map((d) => (
              <Card key={d.name} className="flex h-full flex-col">
                <h3 className="display text-3xl">{d.name}</h3>
                <div className="gold-rule my-5 w-14" />
                <p className="lede flex-1 text-sm">{d.blurb}</p>
                <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-champagne">
                  {formatUSD(adventures.perPassengerFare)} round trip
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/plan-my-trip?kind=transportation">Reserve adventure seats</Button>
            <Button href="/transportation" variant="outline">
              All transportation
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="max-w-3xl">
          <InquiryForm defaultKind="experience" source="/tours-experiences" heading="Build my day" />
        </Container>
      </section>

      <CTABand
        title="Book the day, not just the ticket"
        lede="Tell us the port, the city or the Saturday — we'll handle the guide, the entry and the ride."
        primary={{ href: "/plan-my-trip?kind=experience", label: "Plan an experience" }}
        secondary={{ href: "/cruises", label: "Shore excursions by sailing" }}
      />
    </>
  );
}
