import type { Metadata } from "next";
import CollectionGrid from "@/components/CollectionGrid";
import InquiryForm from "@/components/InquiryForm";
import { Button, Container, CTABand, PageHero, SectionHeading } from "@/components/ui";
import { resortCollections } from "@/config/content";

export const metadata: Metadata = {
  title: "Resorts",
  description:
    "Beachfront, adults-only, family and villa resort collections — booked by building, floor and view, with resort credits and club-level access applied where offered.",
};

const regions = [
  { name: "Riviera Maya & Cancún", note: "The deepest all-inclusive inventory in the hemisphere." },
  { name: "Punta Cana", note: "Value-forward all-inclusives with strong family programming." },
  { name: "Jamaica", note: "Adults-only and butler-service properties along the north coast." },
  { name: "Costa Rica", note: "Rainforest-and-beach combinations with real adventure days." },
  { name: "Hawaii", note: "Island-by-island guidance — the wrong island ruins a good trip." },
  { name: "Turks & Caicos", note: "Grace Bay residences for multi-family groups." },
];

export default function ResortsPage() {
  return (
    <>
      <PageHero
        eyebrow="Resort collection"
        title="The right room, not just the right resort"
        lede="Two guests in the same resort can have completely different weeks. We book by building, floor and view — and tell you which categories are worth the upgrade."
      >
        <Button href="/plan-my-trip?kind=resort">Request resort options</Button>
      </PageHero>

      <section className="py-24">
        <Container>
          <SectionHeading eyebrow="Collections" title="Four resort styles" />
          <div className="mt-14">
            <CollectionGrid items={resortCollections} />
          </div>
        </Container>
      </section>

      <section className="border-y border-white/6 bg-gradient-to-b from-midnight-deep to-onyx py-24">
        <Container>
          <SectionHeading eyebrow="Where we send people" title="Regions we know cold" align="center" />
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {regions.map((r) => (
              <div key={r.name} className="border border-white/8 bg-onyx-raised/50 px-6 py-5">
                <h3 className="display text-2xl">{r.name}</h3>
                <p className="mt-2 text-sm text-smoke">{r.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="max-w-3xl">
          <InquiryForm defaultKind="resort" source="/resorts" heading="Find my resort" />
        </Container>
      </section>

      <CTABand
        title="Beach week, planned properly"
        lede="Send us the dates, the party and whether you want quiet or a water park. We'll come back with three properties and the honest difference between them."
        primary={{ href: "/plan-my-trip?kind=resort", label: "Request options" }}
        secondary={{ href: "/vacations", label: "See vacation packages" }}
      />
    </>
  );
}
