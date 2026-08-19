/**
 * Transportation quote engine.
 *
 * Brief §8: "Transportation airport pricing is based on separate TravelParty
 * bookings, not simply total passenger count." Each travel party pays a party
 * fare covering up to N passengers; unrelated parties may ride the same vehicle
 * and are quoted (and invoiced) independently.
 */
import {
  adventures,
  airportLanes,
  charter,
  nightlife,
  serviceFees,
  type AirportLane,
} from "@/config/business";

export type ServiceId = "airport" | "nightlife" | "adventure" | "charter";

export interface QuoteLine {
  label: string;
  detail?: string;
  amount: number;
}

export interface Quote {
  service: ServiceId;
  lines: QuoteLine[];
  subtotal: number;
  /** True when the total needs an advisor — charters and over-capacity groups. */
  requiresQuote: boolean;
  notes: string[];
}

export interface QuoteRequest {
  service: ServiceId;
  /** Airport lane id, e.g. "altus-okc". */
  laneId?: string;
  /** Number of separate travel parties sharing the booking (airport lanes). */
  parties?: number;
  /** Total passengers across the booking. */
  passengers?: number;
  roundTrip?: boolean;
  /** Charter estimate only. */
  hours?: number;
  planningFee?: boolean;
}

const money = (n: number) => Math.round(n * 100) / 100;

export const findLane = (laneId?: string): AirportLane | undefined =>
  airportLanes.find((l) => l.id === laneId);

/** Passengers a single party may carry before per-head charges apply. */
export const partyCapacity = (lane: AirportLane) => lane.includedPassengers;

export function quote(req: QuoteRequest): Quote {
  const lines: QuoteLine[] = [];
  const notes: string[] = [];
  let requiresQuote = false;

  const passengers = Math.max(1, req.passengers ?? 1);
  const parties = Math.max(1, req.parties ?? 1);

  if (req.service === "airport") {
    const lane = findLane(req.laneId) ?? airportLanes[0];
    const legs = req.roundTrip ? 2 : 1;
    const legLabel = legs === 2 ? "round trip" : "one way";

    // Every party pays the lane fare. Passengers beyond the included count are
    // charged per head against the party they belong to.
    const includedTotal = parties * lane.includedPassengers;
    const overflow = Math.max(0, passengers - includedTotal);

    lines.push({
      label: `${lane.from} → ${lane.airportCode}`,
      detail: `${parties} travel ${parties === 1 ? "party" : "parties"} × $${lane.partyFare} (${legLabel}, up to ${lane.includedPassengers} passengers per party)`,
      amount: money(lane.partyFare * parties * legs),
    });

    if (overflow > 0) {
      lines.push({
        label: "Additional passengers",
        detail: `${overflow} beyond the ${includedTotal} included × $${lane.additionalPassengerFare}`,
        amount: money(overflow * lane.additionalPassengerFare * legs),
      });
      notes.push("Additional passengers are seated subject to vehicle capacity — dispatch confirms at booking.");
    }

    if (passengers > parties * lane.includedPassengers + 3) {
      requiresQuote = true;
      notes.push("Groups this size move on a second vehicle or a coach; an advisor will confirm the final fare.");
    }
    notes.push(lane.note ?? "");
  }

  if (req.service === "nightlife") {
    const overflow = Math.max(0, passengers - nightlife.includedPassengers);
    lines.push({
      label: nightlife.title,
      detail: `${nightlife.route} — private to your group, up to ${nightlife.includedPassengers} passengers`,
      amount: money(nightlife.baseFare),
    });
    if (overflow > 0) {
      lines.push({
        label: "Additional passengers",
        detail: `${overflow} × $${nightlife.additionalPassengerFare}`,
        amount: money(overflow * nightlife.additionalPassengerFare),
      });
    }
    notes.push("Private service — the vehicle is yours for the evening, not shared.");
  }

  if (req.service === "adventure") {
    lines.push({
      label: "Saturday adventure seats",
      detail: `${passengers} × $${adventures.perPassengerFare} round trip`,
      amount: money(passengers * adventures.perPassengerFare),
    });
    if (!adventures.admissionIncluded) {
      notes.push("Attraction admission is purchased separately unless your advisor packages it.");
    }
  }

  if (req.service === "charter") {
    const hours = Math.max(charter.minimumHours, req.hours ?? charter.minimumHours);
    requiresQuote = true;
    lines.push({
      label: "Private charter",
      detail: `${hours} hours × ${passengers} passengers — routed and quoted by an advisor`,
      amount: 0,
    });
    notes.push(
      `Charters run a ${charter.minimumHours}-hour minimum with a ${Math.round(charter.depositPercent * 100)}% deposit to hold the date.`,
    );
  }

  if (req.planningFee) {
    lines.push({
      label: "Custom journey planning",
      detail: "Door-to-door itinerary design, credited against booked travel",
      amount: serviceFees.customJourneyPlanning,
    });
  }

  const subtotal = money(lines.reduce((sum, l) => sum + l.amount, 0));
  return { service: req.service, lines, subtotal, requiresQuote, notes: notes.filter(Boolean) };
}

export const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
