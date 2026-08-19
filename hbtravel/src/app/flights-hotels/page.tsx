import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { GridLines } from "@/components/art";
import { Button, Card, Container, CTABand, FAQ, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Flights & Hotels",
  description:
    "Air, hotels and rental cars booked into one itinerary — with seat assignments, hotel category guidance and ground transportation on both ends.",
};

const services = [
  {
    title: "Air",
    body: "Domestic and international ticketing in every cabin, including award-adjacent routings, positioning flights for cruises and multi-city fares that search engines will not build.",
    points: ["Seat assignments confirmed at ticketing", "Schedule-change monitoring", "Business and premium cabin sourcing"],
  },
  {
    title: "Hotels",
    body: "Preferred-partner rates at properties where the added value is real: breakfast for two, a room-category upgrade at check-in, a property credit and early check-in when the house allows it.",
    points: ["Preferred-partner amenities", "Room, floor and view guidance", "Group room blocks"],
  },
  {
    title: "Rental cars & rail",
    body: "Rates that include the coverage travelers usually decline by accident, plus European rail passes and point-to-point tickets when driving is the wrong call.",
    points: ["Insurance-inclusive rates", "One-way and airport drop", "Rail passes and seat reservations"],
  },
];

const faq = [
  {
    q: "Can you match an online fare?",
    a: "Usually, and when we cannot we will tell you plainly. What an online fare rarely includes is a human who can rebook you at 11 p.m. when a schedule change strands your connection.",
  },
  {
    q: "Do you book award tickets?",
    a: "We advise on them and build the surrounding trip around them. Redemption itself stays in your loyalty account.",
  },
  {
    q: "Can I add ground transportation to a flight booking?",
    a: "Yes — that is the point of the model. OKC and DFW transfers are ours, so a flight booking can include the ride to the terminal and the pickup at baggage claim.",
  },
];

export default function FlightsHotelsPage() {
  return (
    <>
      <PageHero
        eyebrow="Air, hotel & car"
        title="The components, handled properly"
        lede="Booked through our supplier network with amenities applied, seats assigned and schedule changes watched — then tied to our own ground transportation on the Oklahoma and Texas end."
      >
        <Button href="/plan-my-trip?kind=flight-hotel">Request a quote</Button>
      </PageHero>

      <section className="relative py-24">
        <GridLines className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />
        <Container className="relative">
          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((s) => (
              <Card key={s.title} className="flex h-full flex-col">
                <h2 className="display text-3xl">{s.title}</h2>
                <div className="gold-rule my-5 w-14" />
                <p className="lede flex-1 text-sm">{s.body}</p>
                <ul className="mt-6 space-y-2 border-t border-white/8 pt-5">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3 text-xs text-smoke">
                      <span className="text-gold">—</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/6 bg-onyx-raised/40 py-24">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Questions" title="Air & hotel, in practice" />
              <div className="mt-10">
                <FAQ items={faq} />
              </div>
            </div>
            <InquiryForm defaultKind="flight-hotel" source="/flights-hotels" heading="Price my flights & hotel" />
          </div>
        </Container>
      </section>

      <CTABand
        title="Traveling out of OKC or DFW?"
        lede="Book the air with us and the drive is already solved. One itinerary, one company, one number to call."
        primary={{ href: "/plan-my-trip?kind=flight-hotel", label: "Get a quote" }}
        secondary={{ href: "/transportation", label: "See transfer fares" }}
      />
    </>
  );
}
