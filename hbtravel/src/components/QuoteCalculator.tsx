"use client";

import { useState } from "react";
import Link from "next/link";
import { airportLanes, adventures, charter, nightlife } from "@/config/business";
import { formatUSD, type Quote, type ServiceId } from "@/lib/pricing";

const services: { id: ServiceId; label: string; hint: string }[] = [
  { id: "airport", label: "Airport Transfer", hint: "Priced per separate travel party" },
  { id: "nightlife", label: "Nightlife Run", hint: "Private to your group" },
  { id: "adventure", label: "Saturday Adventure", hint: "Per passenger, round trip" },
  { id: "charter", label: "Private Charter", hint: "Advisor-quoted" },
];

const field =
  "w-full border border-white/12 bg-onyx-panel px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold/60";
const labelCls = "block text-[0.65rem] uppercase tracking-[0.24em] text-smoke";

export default function QuoteCalculator({ compact = false }: { compact?: boolean }) {
  const [service, setService] = useState<ServiceId>("airport");
  const [laneId, setLaneId] = useState(airportLanes[0].id);
  const [parties, setParties] = useState(1);
  const [passengers, setPassengers] = useState(2);
  const [roundTrip, setRoundTrip] = useState(false);
  const [hours, setHours] = useState<number>(charter.minimumHours);
  const [result, setResult] = useState<Quote | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getQuote() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ service, laneId, parties, passengers, roundTrip, hours }),
      });
      if (!res.ok) throw new Error("Quote unavailable");
      setResult((await res.json()) as Quote);
    } catch {
      setError("We couldn't price that right now — call dispatch and we'll quote it live.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`panel panel-gold ${compact ? "p-6" : "p-8"}`}>
      <p className="eyebrow">Instant fare estimate</p>
      <h3 className="display mt-3 text-3xl">Price your ride</h3>
      <p className="lede mt-3 text-sm">
        Airport fares are quoted per separate travel party — up to {airportLanes[0].includedPassengers} passengers each.
        Unrelated parties may share the vehicle; each pays its own fare.
      </p>

      <div className="mt-7 grid gap-2 sm:grid-cols-2">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setService(s.id);
              setResult(null);
            }}
            className={`border px-4 py-3 text-left transition-colors ${
              service === s.id ? "border-gold/70 bg-gold/10" : "border-white/10 hover:border-gold/35"
            }`}
          >
            <span className="block text-xs uppercase tracking-[0.18em] text-champagne">{s.label}</span>
            <span className="mt-1 block text-[0.7rem] text-smoke">{s.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {service === "airport" ? (
          <>
            <div>
              <label className={labelCls} htmlFor="lane">
                Lane
              </label>
              <select id="lane" className={`${field} mt-2`} value={laneId} onChange={(e) => setLaneId(e.target.value)}>
                {airportLanes.map((lane) => (
                  <option key={lane.id} value={lane.id}>
                    {lane.airportCode} — {formatUSD(lane.partyFare)} per party
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="parties">
                Separate travel parties
              </label>
              <input
                id="parties"
                type="number"
                min={1}
                max={20}
                className={`${field} mt-2`}
                value={parties}
                onChange={(e) => setParties(Number(e.target.value))}
              />
            </div>
          </>
        ) : null}

        {service === "charter" ? (
          <div>
            <label className={labelCls} htmlFor="hours">
              Hours needed (min {charter.minimumHours})
            </label>
            <input
              id="hours"
              type="number"
              min={charter.minimumHours}
              max={24}
              className={`${field} mt-2`}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>
        ) : null}

        <div>
          <label className={labelCls} htmlFor="passengers">
            Total passengers
          </label>
          <input
            id="passengers"
            type="number"
            min={1}
            max={60}
            className={`${field} mt-2`}
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
          />
        </div>

        {service === "airport" ? (
          <label className="flex items-end gap-3 pb-3 text-sm text-ivory/80">
            <input
              type="checkbox"
              checked={roundTrip}
              onChange={(e) => setRoundTrip(e.target.checked)}
              className="h-4 w-4 accent-[#d4af37]"
            />
            Round trip
          </label>
        ) : null}
      </div>

      <button
        type="button"
        onClick={getQuote}
        disabled={pending}
        className="mt-7 w-full bg-gradient-to-r from-gold-deep via-gold to-champagne px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-onyx transition-all hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Pricing…" : "Calculate fare"}
      </button>

      {error ? <p className="mt-4 text-sm text-champagne">{error}</p> : null}

      {result ? (
        <div className="mt-7 border-t border-gold/20 pt-6">
          <ul className="space-y-3">
            {result.lines.map((line) => (
              <li key={line.label} className="flex items-baseline justify-between gap-6">
                <span>
                  <span className="block text-sm text-ivory">{line.label}</span>
                  {line.detail ? <span className="block text-xs text-smoke">{line.detail}</span> : null}
                </span>
                <span className="display shrink-0 text-xl text-champagne">
                  {line.amount > 0 ? formatUSD(line.amount) : "Quoted"}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
            <span className="text-[0.65rem] uppercase tracking-[0.24em] text-smoke">
              {result.requiresQuote ? "Estimate before advisor review" : "Fare estimate"}
            </span>
            <span className="display gold-text text-4xl">
              {result.subtotal > 0 ? formatUSD(result.subtotal) : "By quote"}
            </span>
          </div>
          {result.notes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {result.notes.map((note) => (
                <li key={note} className="text-xs text-smoke">
                  · {note}
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href={`/plan-my-trip?kind=transportation&service=${service}`}
            className="mt-6 inline-flex w-full items-center justify-center border border-gold/50 px-6 py-3 text-xs uppercase tracking-[0.22em] text-champagne transition-colors hover:bg-gold/10"
          >
            Reserve this ride
          </Link>
        </div>
      ) : null}

      <p className="mt-6 text-[0.7rem] leading-relaxed text-smoke/80">
        Nightlife service runs {formatUSD(nightlife.baseFare)} for up to {nightlife.includedPassengers} guests plus{" "}
        {formatUSD(nightlife.additionalPassengerFare)} per additional guest. Saturday adventures are{" "}
        {formatUSD(adventures.perPassengerFare)} per passenger round trip; attraction admission is separate.
      </p>
    </div>
  );
}
