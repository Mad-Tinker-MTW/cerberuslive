# Scope Statement
**Cerberus Live Studio**
Document ID: CLS-PMD-002
Version: 1.0
Date: 2026-06-28
Project Manager: Francisco De La Paz

---

## Project Description

Cerberus Live Studio is a creator platform delivered as a Next.js 15.5 application backed by Cloudflare infrastructure. The frontend deploys to Cloudflare Workers through the OpenNext adapter, the API runs on Cloudflare Workers, data lives in Cloudflare D1, and admin-hosted media lives in Cloudflare R2. The defining architectural property is that artists self-host their own media through a Cloudflare Tunnel driven by an Electron desktop agent, so the platform stores only the directory and the tunnel URL rather than the media itself.

The product is built in six phases on top of a live Phase 0 waitlist.

---

## Product Scope

### Included Features

**Phase 0: Waitlist (live)**
- Static landing page served by a single Cloudflare Worker via the ASSETS binding
- `POST /api/waitlist` endpoint capturing email and role into D1
- Cloudflare Turnstile bot protection
- Email routing for hello@ and admin@

**Phase 1: MVP Platform**
- Authentication: sign up, log in, email verify
- Account roles: artist, fan, venue, admin
- Artist profile creation: bio, genre tags, photo, social links
- Public artist page at cerberuslive.studio/artist/{slug}
- Fan accounts and follow system
- Central discovery feed, browse artists by genre
- Admin dashboard for signups, users, and approvals
- Waitlist email migration to platform invites
- Resend confirmation emails on waitlist signup

**Phase 2: Media Vault**
- Electron artist agent, Windows first, wrapping cloudflared and a local Express server
- Track upload UI on the artist dashboard
- Public media player on the artist profile
- Featured track on the profile card
- Play count tracking
- R2 admin-hosted always-on storage tier

**Phase 3: Live Room and Venues**
- Live stream window on the artist profile
- Artist agent stream output
- Event scheduling
- Central live feed, who is live now by genre
- 10-minute cap on the free tier, extendable via paid
- Manual Live Room approval flow
- Report button on every stream
- Venue profiles: space, capacity, dates, genre preferences
- Territory claim system (Booking Ready tier)
- Geographic discovery feed

**Phase 4: Booking Layer**
- Artist availability calendar
- Booking request form, venue to artist
- Accept, decline, and counter flow
- Booking confirmation and messaging thread
- Book This Artist, Request a Live Set, and Invite to Venue buttons
- Venue discovery dashboard

**Phase 5: Cerberus Managed**
- Managed artist badge
- Managed contract creation and tracking
- Commission tracking per booking (17.5% artist side, 12.5% venue side)
- Showcase creation and management tools
- Open platform performer slot booking with $250 flat or 25-ticket minimum
- Artist reporting and press kit PDF export
- Sponsorship tracking for showcases

**Phase 6: Monetization and Growth**
- Stripe integration for paid tiers
- R2 storage billing
- Live time extension purchases
- Artist analytics dashboard
- Segmented waitlist email campaigns
- Social sharing and embeddable player
- Content ID scanning for admin-hosted files

---

## Not In Scope

The following are explicitly excluded from the current project lifecycle and will be addressed only if formally added to the roadmap:

- Storage-first streaming (the architecture is deliberately storage-light)
- Real-time copyright scanning of live streams (report-and-takedown is the standard)
- Native mobile applications
- A Mac build of the artist agent before the Windows build ships
- Label, distribution, or rights-management services
- Public API beyond the platform's own needs

---

## Deliverable Acceptance Criteria

### Phase 0: Waitlist (complete)
- Landing page live at cerberuslive.studio over SSL
- Signup writes email and role to D1
- Turnstile challenge passes end to end (widget to token to siteverify to D1 row)

### Phase 1: MVP Platform
- A user can sign up, verify email, and log in
- An artist can create a profile and it renders at a public slug URL
- A fan can follow an artist
- The discovery feed lists artists filterable by genre
- The admin dashboard shows signups and can approve users
- Waitlist emails can be invited into the platform

### Phase 2: Media Vault
- The artist agent installs without admin rights and serves a music folder in one click
- A self-hosted track plays on the public profile via the tunnel URL
- Play counts increment
- The R2 admin-hosted tier serves a track always-on

### Phase 3: Live Room and Venues
- An approved artist can go live and the stream renders on the profile
- The free tier enforces the 10-minute cap
- A report button is present on every stream
- A venue can list a space and appear in geographic discovery

### Phase 4: Booking Layer
- A venue can send a booking request and an artist can accept, decline, or counter
- A confirmed booking opens a messaging thread
- The availability calendar reflects accepted bookings

### Phase 5: Cerberus Managed
- A managed contract tracks the monthly rate and commission
- Commission is computed correctly per booking by side
- A showcase tracks cost coverage first, then the split

### Phase 6: Monetization
- A paid tier subscription completes through Stripe
- R2 usage is billed
- The artist analytics dashboard reports plays, follows, and bookings

---

## Constraints

- Solo developer, no external team; Francisco De La Paz performs all roles
- No dedicated QA environment; testing is in-use validation
- Self-hosted media depends on residential artist machines and upload speeds
- Live streaming cannot be scanned in real time, so moderation is approval-and-report
- Timeline driven by personal capacity, not external deadlines

---

## Assumptions

- Cloudflare free and low tiers are sufficient through early phases
- Artists will tolerate running a desktop agent in exchange for owning their media
- The Electron agent can be made simple enough for non-technical artists
- The deployment target is Cloudflare Workers via OpenNext; the registry enum lacks a Workers value and is tagged cloudflare-pages as the nearest match
- All development occurs on the TINKERSWORKSHOP workstation
