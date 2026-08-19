import type { Metadata } from "next";
import CollectionGrid from "@/components/CollectionGrid";
import InquiryForm from "@/components/InquiryForm";
import { CompassRose } from "@/components/art";
import { Button, Card, Container, CTABand, PageHero, SectionHeading } from "@/components/ui";
import { vacationCollections } from "@/config/content";
import { serviceFees } from "@/config/business";
import { formatUSD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Vacations",
  description:
    "All-inclusive beach escapes, escorted tours, independent journeys and milestone celebrations — air, hotel, transfers and insurance quoted as one number.",
};

const included = [
  { title: "Air", body: "Coach, premium and business class, ticketed with seats assigned — not held in a cart." },
  { title: "Hotels & resorts", body: "Booked by building, floor and view, with resort credits applied where offered." },
  { title: "Transfers", body: "Airport-to-resort transfers abroad, and our own vehicles on the Oklahoma and Texas end." },
  { title: "Tours & excursions", body: "Vetted operators, timed-entry tickets and accessibility screening." },
  { title: "Rental cars", body: "Rates that include the coverage most travelers accidentally decline." },
  { title: "Travel insurance", body: "Quoted on every trip with exclusions in plain language before you buy." },
];

export default function VacationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Full travel services"
        title="A vacation, quoted as one number"
        lede="Flights, hotels, resorts, rental cars, packages, tours, attractions, excursions and insurance — assembled by an advisor and delivered as a single Highways & Byways itinerary."
      >
        <div className="flex flex-wrap gap-4">
          <Button href="/plan-my-trip?kind=vacation">Plan a vacation</Button>
          <Button href="/resorts" variant="outline">
            Browse resorts
          </Button>
        </div>
      </PageHero>

      <section className="py-24">
        <Container>
          <SectionHeading eyebrow="Collections" title="Four ways to travel" lede="Every one of these is built to your dates, your party and your tolerance for a schedule." />
          <div className="mt-14">
            <CollectionGrid items={vacationCollections} />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-y border-white/6 bg-onyx-raised/40 py-24">
        <CompassRose className="pointer-events-none absolute -right-32 top-10 opacity-10" size={420} />
        <Container className="relative">
          <SectionHeading eyebrow="What we book" title="Everything on one itinerary" align="center" />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {included.map((item) => (
              <Card key={item.title}>
                <h3 className="display text-2xl text-champagne">{item.title}</h3>
                <p className="lede mt-3 text-sm">{item.body}</p>
              </Card>
            ))}
          </div>
          <p className="lede mx-auto mt-12 max-w-2xl text-center text-sm">
            Standard vacation and cruise bookings carry no planning fee. Fully custom multi-country journeys carry a{" "}
            {formatUSD(serviceFees.customJourneyPlanning)} planning fee, credited back against booked travel.
          </p>
        </Container>
      </section>

      <section className="py-24">
        <Container className="max-w-3xl">
          <InquiryForm defaultKind="vacation" source="/vacations" heading="Tell us about the trip" />
        </Container>
      </section>

      <CTABand
        title="One advisor. Every component."
        lede="Stop assembling a vacation across six tabs. Give us the window and the wish list — we'll come back with a plan and a number."
        primary={{ href: "/plan-my-trip?kind=vacation", label: "Plan my vacation" }}
        secondary={{ href: "/cruises", label: "Consider a cruise" }}
      />
    </>
  );
}
