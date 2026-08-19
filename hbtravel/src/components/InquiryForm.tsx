"use client";

import { useState } from "react";
import type { InquiryKind } from "@/lib/inquiry";

const field =
  "w-full border border-white/12 bg-onyx-panel px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-smoke/60 focus:border-gold/60";
const labelCls = "block text-[0.65rem] uppercase tracking-[0.24em] text-smoke";

const kinds: { id: InquiryKind; label: string }[] = [
  { id: "cruise", label: "Cruise" },
  { id: "vacation", label: "Vacation package" },
  { id: "flight-hotel", label: "Flights & hotels" },
  { id: "resort", label: "Resort stay" },
  { id: "experience", label: "Tours & experiences" },
  { id: "transportation", label: "Ground transportation" },
  { id: "military", label: "Military / official travel" },
];

export default function InquiryForm({
  defaultKind = "cruise",
  source = "site",
  compact = false,
  heading = "Start your itinerary",
}: {
  defaultKind?: InquiryKind;
  source?: string;
  compact?: boolean;
  heading?: string;
}) {
  const [kind, setKind] = useState<InquiryKind>(defaultKind);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, kind, source }),
      });
      if (res.status === 422) {
        const data = (await res.json()) as { errors: Record<string, string> };
        setErrors(data.errors);
        return;
      }
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { reference: string };
      setReference(data.reference);
    } catch {
      setErrors({ form: "Something went wrong on our end. Call us and we'll take it by phone." });
    } finally {
      setPending(false);
    }
  }

  if (reference) {
    return (
      <div className="panel panel-gold p-8 text-center">
        <p className="eyebrow">Request received</p>
        <p className="display mt-4 text-4xl gold-text">{reference}</p>
        <p className="lede mx-auto mt-5 max-w-md text-sm">
          Keep this reference. An advisor will reach out within one business day — sooner for transportation inside 72
          hours. Everything we quote comes to you in writing, supplier terms attached.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`panel panel-gold ${compact ? "p-6" : "p-8"}`} noValidate>
      <p className="eyebrow">No obligation</p>
      <h3 className="display mt-3 text-3xl">{heading}</h3>

      <fieldset className="mt-7">
        <legend className={labelCls}>What are we planning?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={`border px-4 py-2 text-[0.7rem] uppercase tracking-[0.16em] transition-colors ${
                kind === k.id ? "border-gold/70 bg-gold/10 text-champagne" : "border-white/10 text-ivory/70 hover:border-gold/35"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">
            Name
          </label>
          <input id="name" name="name" className={`${field} mt-2`} placeholder="Full name" autoComplete="name" />
          {errors.name ? <p className="mt-2 text-xs text-champagne">{errors.name}</p> : null}
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className={`${field} mt-2`} placeholder="you@example.com" autoComplete="email" />
          {errors.email ? <p className="mt-2 text-xs text-champagne">{errors.email}</p> : null}
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" className={`${field} mt-2`} placeholder="(580) 555-0100" autoComplete="tel" />
          {errors.phone ? <p className="mt-2 text-xs text-champagne">{errors.phone}</p> : null}
        </div>
        <div>
          <label className={labelCls} htmlFor="partySize">
            Travelers
          </label>
          <input id="partySize" name="partySize" type="number" min={1} max={200} className={`${field} mt-2`} placeholder="2" />
          {errors.partySize ? <p className="mt-2 text-xs text-champagne">{errors.partySize}</p> : null}
        </div>
        <div>
          <label className={labelCls} htmlFor="destination">
            Destination or sailing
          </label>
          <input id="destination" name="destination" className={`${field} mt-2`} placeholder="Western Caribbean, Rhine, Cancún…" />
        </div>
        <div>
          <label className={labelCls} htmlFor="travelWindow">
            Travel window
          </label>
          <input id="travelWindow" name="travelWindow" className={`${field} mt-2`} placeholder="Late March, flexible ±1 week" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="budget">
            Budget guidance
          </label>
          <select id="budget" name="budget" className={`${field} mt-2`} defaultValue="">
            <option value="">Prefer to discuss</option>
            <option value="under-2500">Under $2,500</option>
            <option value="2500-5000">$2,500 – $5,000</option>
            <option value="5000-10000">$5,000 – $10,000</option>
            <option value="10000-25000">$10,000 – $25,000</option>
            <option value="25000-plus">$25,000+</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="message">
            Anything we should know
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className={`${field} mt-2 resize-none`}
            placeholder="Pickup city, occasion, mobility needs, cabin preferences, orders dates…"
          />
        </div>
      </div>

      {errors.form ? <p className="mt-5 text-sm text-champagne">{errors.form}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full bg-gradient-to-r from-gold-deep via-gold to-champagne px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-onyx transition-all hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request my plan"}
      </button>
      <p className="mt-4 text-[0.7rem] text-smoke/80">
        We use your details to build the quote and nothing else. No lists, no resale.
      </p>
    </form>
  );
}
