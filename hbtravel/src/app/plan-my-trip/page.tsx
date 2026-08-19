import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { CompassRose } from "@/components/art";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { contact, serviceFees } from "@/config/business";
import type { InquiryKind } from "@/lib/inquiry";
import { formatUSD } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Plan My Trip",
  description:
    "Tell us where you're headed. An advisor answers within one business day with a written plan — supplier terms, fares and transportation included.",
};

const KINDS: InquiryKind[] = ["cruise", "vacation", "flight-hotel", "resort", "experience", "transportation", "military"];

const steps = [
  { title: "You send the shape of the trip", body: "Destination or sailing, window, party size and anything that has to be true." },
  { title: "An advisor is assigned", body: "One named person owns your file from the first call to the ride home." },
  { title: "A written plan comes back", body: "Two or three real options with inclusions, deposit dates and cancellation terms attached." },
  { title: "You approve; we book", body: "Deposits, documents, seat assignments, transfers and insurance — handled and tracked." },
];

export default async function PlanMyTripPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; service?: string }>;
}) {
  const params = await searchParams;
  const requested = (params.kind ?? "") as InquiryKind;
  const defaultKind: InquiryKind = KINDS.includes(requested) ? requested : "cruise";

  return (
    <>
      <PageHero
        eyebrow="Plan my trip"
        title="Tell us where you're headed"
        lede={`No obligation, no lists, no resale of your details. Standard cruise and vacation bookings carry no planning fee; fully custom journeys carry a ${formatUSD(serviceFees.customJourneyPlanning)} fee credited back against booked travel.`}
      />

      <section className="relative overflow-hidden py-20">
        <CompassRose className="pointer-events-none absolute -left-40 top-24 opacity-10" size={520} />
        <Container className="relative">
          <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <SectionHeading eyebrow="What happens next" title="Four steps, one advisor" />
              <ol className="mt-10 space-y-6">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-5 border-b border-white/8 pb-6">
                    <span className="display gold-text text-3xl">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="display text-2xl">{step.title}</h3>
                      <p className="lede mt-2 text-sm">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 panel p-6">
                <p className="text-[0.65rem] uppercase tracking-[0.26em] text-gold">Prefer to talk?</p>
                <p className="display mt-3 text-3xl">
                  <a href={contact.phoneHref} className="transition-colors hover:text-champagne">
                    {contact.phone}
                  </a>
                </p>
                <p className="mt-2 text-sm text-smoke">{contact.hours}</p>
              </div>
            </div>

            <div className="lg:sticky lg:top-32">
              <InquiryForm
                defaultKind={defaultKind}
                source={params.service ? `/plan-my-trip?service=${params.service}` : "/plan-my-trip"}
                heading="Start your itinerary"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
