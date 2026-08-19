/**
 * Highways & Byways Travel — single source of business configuration.
 *
 * Build brief §2 and §3: host-plan percentages, fees, commission rules and
 * transportation pricing are CONFIGURATION, never hard-coded assumptions.
 * Moving Nexion 80 -> Nexion 90, or repricing a lane, is an edit here (and,
 * in Phase 2+, an admin write that overrides these defaults) — not a rebuild.
 */

export type HostPlanId = "nexion-80" | "nexion-90";

export interface HostPlan {
  id: HostPlanId;
  hostAgency: string;
  label: string;
  /** Share of supplier commission retained by Highways & Byways, 0..1. */
  nonAirCommissionShare: number;
  airCommissionShare: number;
  purpose: string;
  economics: string;
}

export const HOST_PLANS: Record<HostPlanId, HostPlan> = {
  "nexion-80": {
    id: "nexion-80",
    hostAgency: "Nexion",
    label: "Nexion 80",
    nonAirCommissionShare: 0.8,
    airCommissionShare: 0.8,
    purpose: "Startup / moderate sales volume",
    economics: "Full supplier network at the 80% non-air commission share.",
  },
  "nexion-90": {
    id: "nexion-90",
    hostAgency: "Nexion",
    label: "Nexion 90",
    nonAirCommissionShare: 0.9,
    airCommissionShare: 0.9,
    purpose: "Higher-volume agency",
    economics: "Same supplier network, improved commission economics.",
  },
};

/** The plan currently in force. Admin-configurable; app logic reads it, never assumes it. */
export const ACTIVE_HOST_PLAN: HostPlanId = "nexion-80";

export const hostPlan = (id: HostPlanId = ACTIVE_HOST_PLAN): HostPlan => HOST_PLANS[id];

export const brand = {
  name: "Highways & Byways Travel",
  shortName: "Highways & Byways",
  initials: "HB",
  tagline: "Highways. Byways. Open Skies.",
  promise: "High standards. Every mile. Any destination.",
  parent: "An Atlantis Prime Holdings Company",
  domain: "highwaysandbywaystravel.com",
  url: "https://highwaysandbywaystravel.com",
  positioning:
    "Luxury travel advisor, cruise specialist and regional executive transportation — one premium brand, front door to front door.",
  founded: 2026,
  homeBase: "Altus, Oklahoma",
  serviceArea: "Southwest Oklahoma & North Texas — OKC and DFW corridors",
} as const;

export const contact = {
  phone: "(580) 555-0147",
  phoneHref: "tel:+15805550147",
  reservations: "reservations@highwaysandbywaystravel.com",
  advisors: "advisors@highwaysandbywaystravel.com",
  groups: "groups@highwaysandbywaystravel.com",
  address: {
    line1: "PO Box 1401",
    city: "Altus",
    state: "OK",
    zip: "73521",
  },
  hours: "Advisors available 7 days — 7:00a to 9:00p CT. Transportation dispatch 24/7.",
  hoursShort: "Advisors 7 days · Dispatch 24/7",
} as const;

/**
 * Transportation pricing (brief §3).
 * Airport fares are per SEPARATE TRAVEL PARTY, not per passenger — multiple
 * unrelated parties may share one vehicle, and each party pays its own fare.
 */
export interface AirportLane {
  id: string;
  from: string;
  to: string;
  airportCode: string;
  /** Fare per travel party, in USD. */
  partyFare: number;
  /** Passengers included in the party fare. */
  includedPassengers: number;
  /** Per-passenger charge past the included count, when capacity allows. */
  additionalPassengerFare: number;
  driveTime: string;
  note?: string;
}

export const airportLanes: AirportLane[] = [
  {
    id: "altus-okc",
    from: "Altus / Altus AFB",
    to: "Will Rogers International",
    airportCode: "OKC",
    partyFare: 189,
    includedPassengers: 5,
    additionalPassengerFare: 45,
    driveTime: "≈ 2 hr 15 min",
    note: "Per separate travel party, up to 5 passengers.",
  },
  {
    id: "altus-dfw",
    from: "Altus / Altus AFB",
    to: "Dallas/Fort Worth International",
    airportCode: "DFW",
    partyFare: 289,
    includedPassengers: 5,
    additionalPassengerFare: 55,
    driveTime: "≈ 3 hr 30 min",
    note: "Per separate travel party, up to 5 passengers.",
  },
];

export const nightlife = {
  id: "altus-bricktown",
  title: "Bricktown Nightlife Run",
  route: "Altus → Oklahoma City (Bricktown District) → Altus",
  baseFare: 599,
  includedPassengers: 5,
  additionalPassengerFare: 50,
  window: "Evening departure, late-night return — private to your group.",
} as const;

export const adventures = {
  perPassengerFare: 79,
  cadence: "Rotating Saturdays",
  admissionIncluded: false,
  destinations: [
    { name: "Frontier City", blurb: "Oklahoma City's classic theme park — coasters, shows and midway." },
    { name: "OKANA Resort", blurb: "Riverfront resort, lagoon and the First Americans Museum district." },
    { name: "RIVERSPORT OKC", blurb: "Whitewater, rapids, sky trail and Olympic training rapids." },
  ],
} as const;

export const charter = {
  minimumHours: 4,
  depositPercent: 0.25,
  occasions: [
    "Concerts & touring shows",
    "Sporting events",
    "Weddings & rehearsal dinners",
    "Casino evenings",
    "Family reunions",
    "Military unit movements & ceremonies",
    "Corporate transportation",
    "Custom multi-day destinations",
  ],
} as const;

export const baggagePolicy = {
  carryOn: "One carry-on per passenger, included on every fare.",
  checked: "Standard airline checked baggage supported on all airport lanes.",
  military:
    "Travelers on official orders receive baggage handling consistent with the operating airline's authorized military allowance, subject to vehicle and trailer capacity.",
  trailerNote: "Oversized loads, unit gear and group luggage move on the cargo trailer — declare at booking.",
} as const;

/** Planning + service fees (brief §5, Direct Revenue). Fully configurable. */
export const serviceFees = {
  customJourneyPlanning: 149,
  groupCruiseDeposit: 250,
  charterDepositPercent: charter.depositPercent,
  tipsTrackedSeparately: true,
} as const;

/** Default supplier commission rates by category — used for expected-commission math (§9). */
export const supplierCommissionRates: Record<string, number> = {
  cruise: 0.16,
  hotel: 0.12,
  resort: 0.13,
  package: 0.13,
  tour: 0.12,
  excursion: 0.12,
  car: 0.08,
  insurance: 0.25,
  air: 0.05,
};

export const cancellation = {
  transportation: "Full refund on airport transfers cancelled 48+ hours before pickup.",
  charter: "Charter deposits are transferable within 12 months; balance refundable to 14 days out.",
  travel: "Supplier terms govern cruise and vacation bookings; your advisor confirms them in writing before deposit.",
} as const;
