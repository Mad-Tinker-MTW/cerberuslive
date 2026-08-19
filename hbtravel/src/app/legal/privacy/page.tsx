import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { brand, contact, hostPlan } from "@/config/business";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Highways & Byways Travel collects, why, who it is shared with and how to have it removed.",
};

export default function PrivacyPage() {
  const plan = hostPlan();
  const sections = [
    {
      title: "What we collect",
      body: "Only what a booking requires: your name, email, phone, party size, travel dates, destination preferences and anything you choose to tell us in a request. For ticketed travel we additionally collect the legal names, dates of birth and document details the supplier requires.",
    },
    {
      title: "Why we collect it",
      body: "To quote, book and service your travel and transportation — and to reach you when something changes. We do not sell, rent or trade traveler data, and we do not add you to marketing lists you did not ask for.",
    },
    {
      title: "Who it is shared with",
      body: `Only the parties needed to deliver the trip: the cruise line, hotel, resort, tour operator, insurer or airline you are booked with, and ${plan.hostAgency}, our host agency, which processes hosted bookings and commissions. Our drivers receive the pickup details required to run your trip and nothing more.`,
    },
    {
      title: "Payments",
      body: "Card details are captured by our payment processor or directly by the supplier. Full card numbers are never stored on our systems.",
    },
    {
      title: "Retention",
      body: "Booking records are retained as long as accounting, tax and supplier-dispute obligations require. Inquiries that never become bookings are removed on request.",
    },
    {
      title: "Your choices",
      body: `Ask us for a copy of what we hold, a correction, or deletion of anything not required for an active booking or a legal obligation. Email ${contact.reservations} and we will confirm in writing.`,
    },
    {
      title: "Cookies and analytics",
      body: "This site uses only what it needs to function. We do not run third-party advertising trackers, and we do not sell behavioral data.",
    },
    {
      title: "Contact",
      body: `${brand.name}, ${contact.address.line1}, ${contact.address.city}, ${contact.address.state} ${contact.address.zip} · ${contact.phone}`,
    },
  ];

  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" lede="Your details exist to build your trip. That is the whole policy." />
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
            Summary written for a Phase 1 launch; have counsel confirm it against your final data flows and applicable
            state privacy law before go-live.
          </p>
        </Container>
      </section>
    </>
  );
}
