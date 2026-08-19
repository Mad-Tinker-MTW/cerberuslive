import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import { brand, contact } from "@/config/business";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach a Highways & Byways advisor or dispatch — by phone, by email, or with a written request.",
};

const channels = [
  { label: "Reservations & advisors", value: contact.reservations, href: `mailto:${contact.reservations}` },
  { label: "New itineraries", value: contact.advisors, href: `mailto:${contact.advisors}` },
  { label: "Groups, charters & units", value: contact.groups, href: `mailto:${contact.groups}` },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a person"
        lede="Advisors handle travel. Dispatch handles vehicles. Both answer — no ticket queue, no chatbot loop."
      />

      <section className="py-24">
        <Container>
          <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <SectionHeading eyebrow="Direct lines" title="How to reach us" />
              <div className="mt-10 space-y-6">
                <div className="panel p-6">
                  <p className="text-[0.65rem] uppercase tracking-[0.26em] text-gold">Phone</p>
                  <p className="display mt-3 text-4xl">
                    <a href={contact.phoneHref} className="transition-colors hover:text-champagne">
                      {contact.phone}
                    </a>
                  </p>
                  <p className="mt-3 text-sm text-smoke">{contact.hours}</p>
                </div>
                {channels.map((c) => (
                  <div key={c.label} className="border-b border-white/8 pb-5">
                    <p className="text-[0.65rem] uppercase tracking-[0.26em] text-smoke">{c.label}</p>
                    <a href={c.href} className="mt-2 block text-lg text-champagne transition-colors hover:text-gold">
                      {c.value}
                    </a>
                  </div>
                ))}
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.26em] text-smoke">Mail</p>
                  <p className="mt-2 text-sm text-ivory/75">
                    {brand.name}
                    <br />
                    {contact.address.line1}
                    <br />
                    {contact.address.city}, {contact.address.state} {contact.address.zip}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.26em] text-smoke">Service area</p>
                  <p className="mt-2 text-sm text-ivory/75">{brand.serviceArea}</p>
                </div>
              </div>
            </div>
            <InquiryForm defaultKind="cruise" source="/contact" heading="Send us a note" />
          </div>
        </Container>
      </section>
    </>
  );
}
