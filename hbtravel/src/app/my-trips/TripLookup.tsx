"use client";

import { useState } from "react";

const field =
  "w-full border border-white/12 bg-onyx-panel px-4 py-3 text-sm text-ivory outline-none transition-colors placeholder:text-smoke/60 focus:border-gold/60";
const labelCls = "block text-[0.65rem] uppercase tracking-[0.24em] text-smoke";

/**
 * Phase 1 trip access: a traveler sends their reference and an advisor pulls the
 * file. Self-serve accounts and live itinerary documents land in Phase 2.
 */
export default function TripLookup() {
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("pending");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "general",
          source: "/my-trips",
          name: data.name,
          email: data.email,
          message: `Trip access request. Booking reference: ${data.reference || "not provided"}. ${data.message ?? ""}`,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const body = (await res.json()) as { reference: string };
      setReference(body.reference);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="panel panel-gold p-8 text-center">
        <p className="eyebrow">Request logged</p>
        <p className="display gold-text mt-4 text-4xl">{reference}</p>
        <p className="lede mx-auto mt-5 max-w-md text-sm">
          Your advisor will send current documents — confirmations, transfer times and payment schedule — to the email
          on file.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel panel-gold p-8" noValidate>
      <p className="eyebrow">Existing travelers</p>
      <h2 className="display mt-3 text-3xl">Pull up my trip</h2>
      <p className="lede mt-3 text-sm">
        Send your booking reference and we&apos;ll return your confirmations, transfer times and payment schedule.
      </p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="lookup-name">
            Name on the booking
          </label>
          <input id="lookup-name" name="name" className={`${field} mt-2`} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="lookup-email">
            Email
          </label>
          <input id="lookup-email" name="email" type="email" className={`${field} mt-2`} autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="lookup-reference">
            Booking reference
          </label>
          <input id="lookup-reference" name="reference" className={`${field} mt-2`} placeholder="HB-XXXXXX" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="lookup-message">
            What do you need?
          </label>
          <textarea
            id="lookup-message"
            name="message"
            rows={3}
            className={`${field} mt-2 resize-none`}
            placeholder="Documents, a transfer time change, a payment question…"
          />
        </div>
      </div>
      {status === "error" ? (
        <p className="mt-5 text-sm text-champagne">That didn&apos;t go through. Call us and we&apos;ll pull the file live.</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "pending"}
        className="mt-7 w-full bg-gradient-to-r from-gold-deep via-gold to-champagne px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-onyx transition-all hover:brightness-110 disabled:opacity-60"
      >
        {status === "pending" ? "Sending…" : "Request my documents"}
      </button>
    </form>
  );
}
