import type { Metadata } from "next";
import CollectionGrid from "@/components/CollectionGrid";
import InquiryForm from "@/components/InquiryForm";
import { ShipSilhouette } from "@/components/art";
import { Button, Card, Container, CTABand, FAQ, PageHero, SectionHeading } from "@/components/ui";
import { cruiseCollections } from "@/config/content";

export const metadata: Metadata = {
  title: "Cruises",
  description:
    "Ocean, river, luxury, expedition, family and group cruises booked by a cruise specialist — with pre-cruise hotels, transfers and door-to-door ground transportation handled.",
};

const process = [
  { title: "Consultation", body: "Sailing style, cabin category, dining, budget and the dates that actually work." },
  { title: "Written proposal", body: "Two or three options side by side with fare inclusions and supplier terms attached." },
  { title: "Deposit & hold", body: "We hold the cabin, track price drops and manage the final-payment calendar." },
  { title: "Door-to-door", body: "Pre-cruise hotel, airport transfers and our own vehicles for the first and last mile." },
];

const faq = [
  {
    q: "Does booking through an advisor cost more?",
    a: "No. Cruise fares are the same as booking direct; the line pays our commission. What changes is the group space, amenity points and the person who fixes it when something breaks.",
  },
  {
    q: "How far out should I book?",
    a: "Six to twelve months for mainstream ocean sailings, twelve to eighteen for expedition, river in peak season and holiday weeks. Suites and connecting cabins go first.",
  },
  {
    q: "What about price drops after deposit?",
    a: "We monitor them. If a fare or promotion improves and the line allows a rebook, we file it — you do not have to watch the website.",
  },
  {
    q: "Can you handle a group of ten cabins?",
    a: "Yes. Eight cabins qualifies as a group with most lines: amenity points, a tour conductor credit and a private onboard event. We manage the roster and deposit dates.",
  },
];

export default function CruisesPage() {
  return (
    <>
      <PageHero
        eyebrow="Cruise specialists"
        title={<>The ship is the easy part.<br />We handle everything around it.</>}
        lede="Cruise is a first-class category here — ocean, river, luxury, expedition, family and group. We book the sailing, the pre-cruise hotel, the excursions and the ride to the terminal in one itinerary."
      >
        <div className="flex flex-wrap gap-4">
          <Button href="/plan-my-trip?kind=cruise">Request a cruise proposal</Button>
          <Button href="/transportation" variant="outline">
            Add port transportation
          </Button>
        </div>
      </PageHero>

      <section className="py-24">
        <Container>
          <SectionHeading eyebrow="Collections" title="Six ways to sail" lede="Pick the one that matches how you travel — we'll narrow it to two or three real options." />
          <div className="mt-14">
            <CollectionGrid items={cruiseCollections} />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-y border-white/6 bg-gradient-to-b from-midnight-deep to-onyx py-24">
        <ShipSilhouette className="pointer-events-none absolute -left-24 bottom-0 w-[40rem] opacity-20" />
        <Container className="relative">
          <SectionHeading eyebrow="How it works" title="From first call to gangway" align="center" />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {process.map((step, i) => (
              <Card key={step.title}>
                <span className="display gold-text text-4xl">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-4 text-2xl">{step.title}</h3>
                <p className="lede mt-3 text-sm">{step.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeading eyebrow="Questions" title="Cruise questions, answered" />
              <div className="mt-10">
                <FAQ items={faq} />
              </div>
            </div>
            <InquiryForm defaultKind="cruise" source="/cruises" heading="Request a cruise proposal" />
          </div>
        </Container>
      </section>

      <CTABand
        title="Sailing soon?"
        lede="Tell us the region and the window. You'll have a written proposal — with fare inclusions and cancellation terms — inside one business day."
        primary={{ href: "/plan-my-trip?kind=cruise", label: "Start my proposal" }}
        secondary={{ href: "/contact", label: "Talk to a specialist" }}
      />
    </>
  );
}
