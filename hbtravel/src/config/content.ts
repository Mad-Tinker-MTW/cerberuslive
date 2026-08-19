/** Editorial content for the public site. Data-driven so pages degrade gracefully. */

export interface Collection {
  slug: string;
  name: string;
  blurb: string;
  detail: string;
  from?: string;
  meta?: string;
  highlights: string[];
}

export const cruiseCollections: Collection[] = [
  {
    slug: "ocean",
    name: "Ocean",
    blurb: "Caribbean, Mexican Riviera, Alaska, Mediterranean and transatlantic sailings.",
    detail:
      "The widest run of itineraries we sell — from a four-night Western Caribbean escape to a fourteen-night Mediterranean crossing. We hold group space with the major lines and match cabin category to how you actually travel.",
    from: "$749 per guest",
    meta: "3 – 14 nights",
    highlights: ["Balcony and suite upgrades", "Onboard credit where available", "Pre- and post-cruise hotel nights"],
  },
  {
    slug: "river",
    name: "River",
    blurb: "Danube, Rhine, Douro, Seine, Mekong and Nile itineraries on small ships.",
    detail:
      "River sailing puts you in the middle of the city, not the port district. Included excursions, all-suite ships and a guest count under 200 make these the easiest first luxury cruise for most travelers.",
    from: "$3,295 per guest",
    meta: "7 – 15 nights",
    highlights: ["Included shore excursions", "Wine and dining programs", "Extended land packages"],
  },
  {
    slug: "luxury",
    name: "Luxury & Ultra-Luxury",
    blurb: "All-suite, all-inclusive ships where fares, gratuities and excursions travel together.",
    detail:
      "Butler service, included flights on select fares, and a crew-to-guest ratio near one to one. We book these with the fare comparison in writing so you can see what an all-inclusive fare actually replaces.",
    from: "$5,900 per guest",
    meta: "7 – 30 nights",
    highlights: ["All-inclusive fare analysis", "Suite category strategy", "Private car transfers included"],
  },
  {
    slug: "expedition",
    name: "Expedition",
    blurb: "Antarctica, the Arctic, Galápagos, Alaska's inside passages and the Kimberley.",
    detail:
      "Ice-class hulls, zodiac landings and expedition teams of naturalists. These sail once or twice a year and sell eighteen months out — planning starts early and deposits move fast.",
    from: "$8,400 per guest",
    meta: "8 – 21 nights",
    highlights: ["Charter flight coordination", "Expedition gear guidance", "Trip insurance strongly advised"],
  },
  {
    slug: "family",
    name: "Family",
    blurb: "Connecting staterooms, kids' programs and shore days that work for every age.",
    detail:
      "We plan family sailings around the two hardest constraints: nap schedules and teenagers. Connecting cabins, dining times that hold, and excursions with a real age floor.",
    from: "$649 per guest",
    meta: "3 – 10 nights",
    highlights: ["Connecting cabin holds", "Character and youth programs", "Ground transfers for strollers and gear"],
  },
  {
    slug: "group",
    name: "Group & Charter",
    blurb: "Reunions, milestone birthdays, weddings, units and corporate incentive sailings.",
    detail:
      "Eight cabins turns a booking into a group: amenity points, a tour conductor credit and a private event onboard. We manage the roster, deposits and final payment dates so the organizer doesn't have to chase anyone.",
    from: "Custom",
    meta: "8+ staterooms",
    highlights: ["Group amenity points", "Roster and payment tracking", "Private onboard events"],
  },
];

export const vacationCollections: Collection[] = [
  {
    slug: "all-inclusive",
    name: "All-Inclusive Beach",
    blurb: "Cancún, Riviera Maya, Punta Cana, Jamaica, Costa Rica and the Bahamas.",
    detail: "Resort, air, transfers and insurance quoted as one number, with the fine print translated.",
    from: "$1,690 per guest",
    meta: "4 – 10 nights",
    highlights: ["Air + resort + transfers", "Adults-only and family options", "Swim-up and club-level rooms"],
  },
  {
    slug: "escorted",
    name: "Escorted Tours",
    blurb: "Europe, Britain, Japan, Egypt and national-park circuits with a tour director.",
    detail: "Bags moved, hotels vetted, guides local. The lowest-friction way to see six cities in twelve days.",
    from: "$3,150 per guest",
    meta: "7 – 18 days",
    highlights: ["Small-group departures", "Single supplement waivers", "Pre-tour extensions"],
  },
  {
    slug: "independent",
    name: "Independent Journeys",
    blurb: "A private driver, a hand-picked hotel list and no group to keep pace with.",
    detail: "You keep your own schedule; we keep the reservations, the transfers and the 24/7 support line.",
    from: "$2,400 per guest",
    meta: "5 – 21 days",
    highlights: ["Private guides and drivers", "Rail and internal air", "Restaurant and experience holds"],
  },
  {
    slug: "milestone",
    name: "Milestone & Celebration",
    blurb: "Honeymoons, anniversaries, retirements and destination weddings.",
    detail: "Registry-style contributions, room-block management and the details that make the photos.",
    from: "$2,950 per couple",
    meta: "Custom",
    highlights: ["Honeymoon registry", "Room blocks and RSVP tracking", "Onsite wedding coordinator liaison"],
  },
];

export const resortCollections: Collection[] = [
  {
    slug: "beachfront",
    name: "Beachfront",
    blurb: "Caribbean and Mexican beachfront with the ocean at the door.",
    detail: "We book by building and floor, not by category name — the difference between a view and a view.",
    from: "$310 / night",
    meta: "Caribbean · Mexico · Hawaii",
    highlights: ["Room-by-room guidance", "Club level and butler floors", "Resort credits where offered"],
  },
  {
    slug: "adults-only",
    name: "Adults-Only",
    blurb: "Quiet pools, chef-driven dining and a guest list over 18.",
    detail: "Ideal for honeymoons and anniversaries; we flag which properties actually enforce the age floor.",
    from: "$395 / night",
    meta: "18+ and 21+ properties",
    highlights: ["Swim-up suites", "Spa and dining credits", "Private beach cabanas"],
  },
  {
    slug: "family-resorts",
    name: "Family Resorts",
    blurb: "Water parks, kids' clubs, connecting suites and family dining.",
    detail: "Rooms that sleep five without a rollaway, and a pool complex that holds attention past day three.",
    from: "$285 / night",
    meta: "Kids stay free options",
    highlights: ["Connecting and bunk suites", "Kids' club programming", "Water park access"],
  },
  {
    slug: "villas",
    name: "Villas & Residences",
    blurb: "Private pools, staffed villas and multi-family residences.",
    detail: "For a group that wants a house with resort service — chef, housekeeping and a driver on call.",
    from: "$1,150 / night",
    meta: "Sleeps 6 – 16",
    highlights: ["Private chef and staff", "Dedicated concierge", "Group ground transportation"],
  },
];

export const experienceCollections: Collection[] = [
  {
    slug: "shore",
    name: "Shore Excursions",
    blurb: "Port-day plans that get you back aboard on time.",
    detail: "Vetted local operators with published return-to-ship guarantees.",
    meta: "Every port we sell",
    highlights: ["Return-to-ship guarantee", "Private and small-group", "Accessibility screening"],
  },
  {
    slug: "guided",
    name: "Guided Tours",
    blurb: "City walks, food halls, museum access and skip-the-line entries.",
    detail: "Half-day and full-day guiding with tickets already in hand.",
    meta: "150+ cities",
    highlights: ["Licensed local guides", "Timed-entry tickets", "Private vehicle upgrades"],
  },
  {
    slug: "attractions",
    name: "Attractions & Theme Parks",
    blurb: "Orlando, Anaheim, Branson, San Antonio and the Oklahoma City circuit.",
    detail: "Park tickets, dining plans and the transportation that ties the days together.",
    meta: "Tickets + transfers",
    highlights: ["Multi-day park tickets", "Dining plans", "Door-to-park transportation"],
  },
  {
    slug: "rare-access",
    name: "Rare Access",
    blurb: "After-hours museum entries, chef's tables, private tastings and box seats.",
    detail: "The bookings that don't have a public checkout page.",
    meta: "By request",
    highlights: ["After-hours access", "Chef's table seatings", "Event and box seating"],
  },
];

export const journeySteps = [
  {
    title: "Altus pickup",
    body: "A Highways & Byways executive vehicle collects your party at home — luggage loaded, trailer attached if the group needs it.",
  },
  { title: "DFW transfer", body: "Straight to the terminal with flight times tracked and a live dispatch contact in your phone." },
  { title: "Pre-cruise hotel", body: "A vetted port-area hotel the night before, because a same-day flight to a sailing is a gamble." },
  { title: "The sailing", body: "Cabin category, dining time and onboard credit set by your advisor before you ever board." },
  { title: "Shore excursions", body: "Port days planned with operators who guarantee a return to the ship on time." },
  { title: "Return flight", body: "Debarkation transfer, airport timing and seat assignments already handled." },
  { title: "DFW pickup", body: "Your driver is tracking the inbound flight. Bags to the vehicle, no rideshare surge." },
  { title: "Home", body: "One itinerary, one invoice trail, one company that answered the phone the whole way." },
];

export const differentiators = [
  {
    title: "We own the first and last mile",
    body: "Most agencies hand you off to a rideshare app at the curb. We operate our own executive fleet across the OKC and DFW corridors, so the transfer is part of the itinerary — not a gap in it.",
  },
  {
    title: "Advisors, not a search box",
    body: "A named advisor owns your file end to end: cabin selection, deposit dates, documents, insurance and the day-of phone number that actually gets answered.",
  },
  {
    title: "Supplier reach through our host agency",
    body: "Our host-agency relationship opens the same cruise, hotel, resort, tour, car and insurance inventory the largest sellers work with — including group space and amenity points you cannot book direct.",
  },
  {
    title: "Military travel is a discipline here",
    body: "We are an Altus AFB neighbor. Orders, PCS windows, R&R timing and unit movements get planners who understand a report-no-later-than date.",
  },
];

export const testimonials = [
  {
    quote:
      "They picked us up in Altus at 4 a.m., had us at DFW with time to spare, and the pre-cruise hotel was already paid. First trip in years where nothing was on me.",
    name: "R. Casteel",
    detail: "Western Caribbean, 7 nights",
  },
  {
    quote:
      "Our advisor rebooked two flights and a transfer the night a storm closed OKC. I found out because she texted me the fix, not because I called.",
    name: "M. Alvarado",
    detail: "Rhine river cruise + Switzerland",
  },
  {
    quote:
      "Moved eighteen of us to Bricktown and back for my retirement. One invoice, one vehicle, nobody driving home.",
    name: "SMSgt (Ret.) D. Whitfield",
    detail: "Group nightlife charter",
  },
];

export const credentials = [
  "Host-agency supported supplier access",
  "Licensed & insured motor carrier",
  "Cruise Lines International Association training track",
  "24/7 dispatch and traveler support",
  "Written quotes with supplier terms attached",
  "Altus AFB community partner",
];

export const homeFaq = [
  {
    q: "Do you charge to plan a trip?",
    a: "Cruise and vacation bookings carry no planning fee — we are compensated by the supplier. Complex custom journeys carry a planning fee that is credited back against booked travel.",
  },
  {
    q: "Can I book only the ground transportation?",
    a: "Yes. Airport transfers, nightlife runs, Saturday adventures and private charters are sold on their own, whether or not the travel is booked with us.",
  },
  {
    q: "Why is the airport fare priced per travel party?",
    a: "Each separate travel party books its own fare covering up to five passengers. Unrelated parties may share a vehicle on the same run — you are never charged for someone else's seat, and you never wait on a stranger's schedule to fill a van.",
  },
  {
    q: "What happens if my flight is delayed?",
    a: "Dispatch tracks inbound flights. Pickups shift with the aircraft, and you keep a live contact rather than a support ticket.",
  },
  {
    q: "Do you handle travel insurance?",
    a: "We quote it on every trip and put the exclusions in writing. For expedition sailings and international travel we recommend it without reservation.",
  },
];
