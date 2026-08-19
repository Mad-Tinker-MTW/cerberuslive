import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { brand, cancellation, charter, contact, hostPlan } from "@/config/business";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Booking, payment, cancellation and transportation terms for Highways & Byways Travel.",
};

export default function TermsPage() {
  const plan = hostPlan();
  const sections = [
    {
      title: "1. Who you are contracting with",
      body: `${brand.name} (${brand.parent}) sells two distinct things. Ground transportation is operated directly by us. Travel bookings — cruises, hotels, resorts, packages, tours, excursions, rental cars, air and insurance — are arranged as an agent for the supplier through our host agency, ${plan.hostAgency}. Supplier terms govern those bookings and are provided in writing before any deposit.`,
    },
    {
      title: "2. Quotes and confirmations",
      body: "Fares and package prices shown on this site are current published rates and are not a contract. A booking exists when we issue a written confirmation and the required deposit is received. Where a published fare and a written confirmation differ, the written confirmation controls.",
    },
    {
      title: "3. Transportation fares",
      body: `Airport transfer fares are charged per separate travel party, covering up to the stated passenger count for that party. Unrelated travel parties may be scheduled into the same vehicle; each party is confirmed and invoiced independently. Additional passengers beyond the included count are accommodated subject to vehicle and trailer capacity at the published per-passenger rate.`,
    },
    {
      title: "4. Baggage",
      body: "One carry-on per passenger is included. Standard airline checked baggage is supported on airport lanes. Travelers on official military orders receive baggage handling consistent with the operating airline's authorized military allowance, subject to vehicle and trailer capacity. Oversized items and group gear must be declared at booking so dispatch can assign a trailer.",
    },
    {
      title: "5. Cancellations and changes",
      body: `${cancellation.transportation} ${cancellation.charter} ${cancellation.travel}`,
    },
    {
      title: "6. Charters",
      body: `Private charters run a ${charter.minimumHours}-hour minimum and require a ${Math.round(charter.depositPercent * 100)}% deposit to hold the date. Routes, timing and passenger counts are confirmed in writing; material changes may re-price the charter.`,
    },
    {
      title: "7. Delays and conditions beyond our control",
      body: "We track inbound flights and adjust pickups accordingly. We are not liable for losses arising from weather, road closures, air-carrier schedule changes, supplier default, mechanical failure or other conditions beyond our reasonable control. This is why we quote travel insurance on every trip.",
    },
    {
      title: "8. Conduct",
      body: "Drivers may decline transport where a passenger's conduct presents a safety risk to the vehicle or other travelers. Fares are not refunded in that circumstance.",
    },
    {
      title: "9. Travel documents",
      body: "Passports, visas, entry requirements and vaccination rules are the traveler's responsibility. We advise on them and flag deadlines, but we cannot board a guest whose documents do not satisfy the carrier or destination.",
    },
    {
      title: "10. Contact",
      body: `Questions about these terms: ${contact.reservations} or ${contact.phone}.`,
    },
  ];

  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" lede="The commitments that come with a booking — plainly stated." />
      <section className="py-20">
        <Container className="max-w-3xl">
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="display text-2xl text-champagne">{s.title}</h2>
                <p className="lede mt-3 text-sm">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 border-t border-white/8 pt-6 text-xs text-smoke">
            These terms are a plain-language summary for a Phase 1 launch and are not legal advice. Have counsel review
            them, along with your state seller-of-travel registrations and motor-carrier obligations, before you take
            live bookings.
          </p>
        </Container>
      </section>
    </>
  );
}
