/** Main navigation, straight from the brief §6 information architecture. */
export interface NavItem {
  href: string;
  label: string;
  blurb?: string;
}

export const mainNav: NavItem[] = [
  { href: "/cruises", label: "Cruises", blurb: "Ocean, river, luxury, expedition, family and group sailings." },
  { href: "/vacations", label: "Vacations", blurb: "All-inclusive, escorted and independent vacation packages." },
  { href: "/flights-hotels", label: "Flights & Hotels", blurb: "Air, hotels and rental cars booked into one itinerary." },
  { href: "/resorts", label: "Resorts", blurb: "Beach, adult-only, family and villa resort collections." },
  { href: "/tours-experiences", label: "Tours & Experiences", blurb: "Guided tours, excursions, attractions and rare access." },
  { href: "/transportation", label: "Transportation", blurb: "OKC/DFW transfers, nightlife, adventures and charters." },
  { href: "/military-travel", label: "Military Travel", blurb: "Orders, PCS, R&R and unit movement built around the mission." },
];

export const actionNav: NavItem[] = [
  { href: "/plan-my-trip", label: "Plan My Trip" },
  { href: "/my-trips", label: "My Trips" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Travel",
    items: [
      { href: "/cruises", label: "Cruises" },
      { href: "/vacations", label: "Vacations" },
      { href: "/flights-hotels", label: "Flights & Hotels" },
      { href: "/resorts", label: "Resorts" },
      { href: "/tours-experiences", label: "Tours & Experiences" },
    ],
  },
  {
    title: "Transportation",
    items: [
      { href: "/transportation#airport", label: "Airport Transfers" },
      { href: "/transportation#nightlife", label: "Nightlife Runs" },
      { href: "/transportation#adventures", label: "Saturday Adventures" },
      { href: "/transportation#charter", label: "Private Charter" },
      { href: "/transportation#baggage", label: "Baggage Policy" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About Us" },
      { href: "/military-travel", label: "Military Travel" },
      { href: "/contact", label: "Contact" },
      { href: "/plan-my-trip", label: "Plan My Trip" },
      { href: "/my-trips", label: "My Trips" },
    ],
  },
];
