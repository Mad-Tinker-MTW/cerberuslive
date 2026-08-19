# Highways & Byways Travel — Phase 1 Website

A Fortune-500-grade marketing and lead-capture site for **Highways & Byways Travel**
("Highways. Byways. Open Skies." — an Atlantis Prime Holdings company): a full-service
luxury travel agency that also operates its own regional executive ground fleet.

Built from the *Business / Codex Build Brief*, using the approved **logo 1** artwork
(HB monogram cut by a highway running to the horizon, gold on onyx).

## Stack

- Next.js 15.5 (App Router) · React 19 · TypeScript · Tailwind v4
- Fonts: Cormorant Garamond (display) + Inter (UI), self-hosted via `next/font`
- Package manager: **bun** (never npm/npx — use `bunx`)
- No database yet: Phase 1 validates and stamps leads; the brief's Postgres/Prisma
  layer drops in behind the existing API contracts.

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build
bun run start    # serve the production build
bun test         # pricing + commission unit tests
bun run lint
```

## What's here

| Route | Purpose |
| --- | --- |
| `/` | Hero, four pillars, cruise collections, live fare calculator, front-door-to-front-door journey, testimonials, FAQ |
| `/cruises` | Six cruise collections (ocean, river, luxury, expedition, family, group) + proposal request |
| `/vacations` | All-inclusive, escorted, independent and milestone packages |
| `/flights-hotels` | Air, hotel and car/rail services |
| `/resorts` | Beachfront, adults-only, family and villa collections |
| `/tours-experiences` | Shore excursions, guided tours, attractions, rare access, Saturday adventures |
| `/transportation` | Published fares, fleet, baggage policy, quote calculator, reservation form |
| `/military-travel` | Orders/PCS/R&R/unit movement, base transfers, military baggage allowance |
| `/plan-my-trip` | Primary lead capture (pre-filled by `?kind=`) |
| `/my-trips` | Traveler document retrieval; self-serve accounts land in Phase 2 |
| `/about`, `/contact`, `/legal/terms`, `/legal/privacy` | Company, contact, legal |
| `/api/quote`, `/api/inquiry` | Server-side pricing and lead intake |

SEO/PWA: per-page metadata, JSON-LD `TravelAgency`, `sitemap.xml`, `robots.txt`,
web manifest, OG card, and a CSP/permissions-policy header set in `next.config.ts`.

## Configuration, not hard-coded assumptions

The brief is explicit that host-plan percentages, fees, commission rules and fares must
be configuration values. Everything lives in `src/config/business.ts`:

- **Host agency plans** — `HOST_PLANS` holds Nexion 80 and Nexion 90; `ACTIVE_HOST_PLAN`
  selects the one in force. Moving 80 → 90 is a one-line change (later: an admin write),
  and `src/lib/commission.ts` recomputes every split from it.
- **Transportation pricing** — airport lanes, nightlife, adventures, charter minimums and
  deposits, baggage and cancellation policy.
- **Service fees** — planning fee, group deposits, charter deposit percentage.
- **Supplier commission rates** — default rate per category, overridable per booking.

Editorial content (collections, journey steps, testimonials, FAQ) lives in
`src/config/content.ts`, and navigation in `src/config/nav.ts`, so pages stay data-driven
and degrade gracefully when a section is only partly filled in.

## Pricing model (the important part)

Airport transfers are priced **per separate travel party**, not per passenger. Each party
pays the lane fare covering up to five passengers; unrelated parties may share a vehicle
and are quoted and invoiced independently. `src/lib/pricing.ts` implements this, and
`test/pricing.test.ts` pins the behaviour (13 tests, `bun test`):

- one party of four to OKC → $189
- three unrelated parties, nine passengers → $567 (3 × $189)
- one party of five to DFW → $289; two parties of five → $578
- passengers past the included count add the per-head rate; oversized groups escalate to
  an advisor quote
- Nexion 80 keeps 80% of gross commission; switching to Nexion 90 changes only the split

`/api/quote` prices server-side so a browser can never set a published fare.

## Brand assets

`public/brand/` holds the approved artwork, background-keyed to transparent so the gold
sits on any surface in the palette:

- `hb-monogram.png` — the mark (header, 404, section marks)
- `hb-lockup.png` — stacked lockup (footer, about)
- `hb-wordmark.png` — wordmark only (header lockup)
- `hb-og.png` — 1200×630 Open Graph card

App icons are `src/app/icon.png` and `src/app/apple-icon.png`.

Palette (`src/app/globals.css`): gold `#d4af37`, champagne `#e6c47a`, onyx `#0a0b0d`,
midnight `#0d1b2a`, platinum `#c0c0c0`.

## Roadmap (brief §12)

- **Phase 1 (this repo)** — luxury public site, cruise/travel pages, transportation pricing,
  quote calculator, inquiry capture. *Remaining before launch:* Stripe deposits, booking
  persistence, transactional confirmation email, admin bookings view.
- **Phase 2** — accounts, dispatch board, drivers, vehicles/trailers, capacity controls,
  return-trip matching, SMS/email, flight tracking.
- **Phase 3** — advisor workflow, cruise/travel quotes, itineraries, suppliers, host
  tracking, commissions (the math already lives in `src/lib/commission.ts`), documents.
- **Phase 4** — supplier/host integrations, advanced search, CRM automation, loyalty and
  referrals, corporate and military accounts.

## Notes for whoever picks this up

- Sample fares, testimonials and credentials are placeholder content written to the brief.
  Replace them with real numbers, real reviews and real registrations before go-live.
- The legal pages are plain-language drafts, not legal advice — have counsel review them
  along with seller-of-travel registrations and motor-carrier obligations.
- Contact details (phone, email, PO box) are placeholders in `src/config/business.ts`.
