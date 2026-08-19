import type { Metadata } from "next";
import TripLookup from "./TripLookup";
import { Button, Card, Container, CTABand, PageHero, SectionHeading } from "@/components/ui";
import { contact } from "@/config/business";

export const metadata: Metadata = {
  title: "My Trips",
  description:
    "Retrieve confirmations, transfer times and payment schedules for a booked Highways & Byways journey, or reach your advisor directly.",
};

const coming = [
  { title: "Live itinerary", body: "Every segment — flights, sailing, hotel nights, excursions and each ground transfer — on one timeline." },
  { title: "Documents", body: "Confirmations, e-docs, luggage tags and insurance certificates, downloadable the moment they issue." },
  { title: "Payments", body: "Deposit and final-payment dates with reminders before a supplier deadline, not after." },
  { title: "Traveler profiles", body: "Passports, known traveler numbers, seat and dining preferences stored once and reused." },
];

export default function MyTripsPage() {
  return (
    <>
      <PageHero
        eyebrow="My trips"
        title="Your journey, in one place"
        lede="Traveler accounts open in the next release. Until then your advisor is the fastest path to anything on your file — documents, transfer times, payment dates or a change of plan."
      >
        <Button href={contact.phoneHref}>Call {contact.phone}</Button>
      </PageHero>

      <section className="py-24">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeading eyebrow="Coming in the next release" title="What will live here" />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {coming.map((c) => (
                  <Card key={c.title}>
                    <h3 className="display text-2xl text-champagne">{c.title}</h3>
                    <p className="lede mt-2 text-sm">{c.body}</p>
                  </Card>
                ))}
              </div>
              <p className="lede mt-8 text-sm">
                Booked with us already? Use the form — an advisor pulls the file and sends current documents to the
                email on your booking.
              </p>
            </div>
            <TripLookup />
          </div>
        </Container>
      </section>

      <CTABand
        title="Not booked yet?"
        lede="Start a plan and you'll have a reference of your own — plus one named advisor from the first call to the ride home."
        primary={{ href: "/plan-my-trip", label: "Plan my trip" }}
        secondary={{ href: "/cruises", label: "Explore cruises" }}
      />
    </>
  );
}
