# Cerberus Live Studio — Roadmap

---

## Phase 0: Waitlist (current, complete)
Capture signups by role while the platform is built.

- [x] Domain: cerberuslive.studio
- [x] Landing page on Cloudflare Pages
- [x] Waitlist Worker plus D1 capturing signups by role
- [x] Logo and brand identity
- [x] hello@ and admin@ email routing to Outlook
- [x] SSL provisioning
- [x] One-worker IaC relaunch (wrangler.jsonc, D1 plus assets bindings)
- [x] Turnstile bot protection wired and verified end to end

---

## Phase 1: MVP Platform
Goal: artist profiles live, shareable, discoverable.

- [x] Next.js app scaffolded (Workers via OpenNext), deployed to preview
- [ ] Auth (sign up, log in, email verify)
- [ ] Artist profile creation (bio, genre, photo, links)
- [x] Public artist page at cerberuslive.studio/artist/{slug}
- [ ] Fan accounts (follow an artist)
- [ ] Central discovery feed (browse artists by genre)
- [ ] Admin dashboard (signups, users, approvals)
- [ ] Migrate waitlist emails to user invites
- [ ] Resend confirmation emails on waitlist signup

---

## Phase 2: Media Vault
Goal: artists can share music.

- [ ] Artist agent app (Electron, Windows first)
- [ ] Track upload UI on artist dashboard
- [ ] Public media player on artist profile
- [ ] Featured track on profile card
- [ ] Play count tracking
- [ ] R2 admin-hosted tier for always-on storage

---

## Phase 3: Live Room + Venues
Goal: artists can go live, venues can list.

- [ ] Live stream window on artist profile
- [ ] Artist agent updated with stream output
- [ ] Event scheduling
- [ ] Central live feed (who is live now, by genre)
- [ ] 10-minute cap on free tier, extended via paid
- [ ] Manual Live Room approval flow
- [ ] Report button on every stream
- [ ] Venue profiles (list space, capacity, dates, genres)
- [ ] Territory claim system (Booking Ready tier)
- [ ] Geographic discovery feed

---

## Phase 4: Booking Layer
Goal: venues can find and book artists.

- [ ] Artist availability calendar
- [ ] Booking request form (venue to artist)
- [ ] Accept, decline, counter flow
- [ ] Booking confirmation and messaging thread
- [ ] Book This Artist button
- [ ] Request a Live Set button
- [ ] Invite to Venue button
- [ ] Venue discovery dashboard

---

## Phase 5: Cerberus Managed
Goal: MTW as booking agent.

- [ ] Managed artist badge on profile
- [ ] Managed contract creation and tracking
- [ ] Commission tracking per booking
- [ ] Showcase creation and management tools
- [ ] Open platform performer slot booking
- [ ] Ticket minimum enforcement
- [ ] Artist reporting (plays, follows, booking history)
- [ ] Press kit PDF export
- [ ] Sponsorship tracking for showcases

---

## Phase 6: Monetization and Growth
Goal: revenue on, acquisition-ready.

- [ ] Stripe integration for paid tiers
- [ ] R2 storage billing
- [ ] Live time extension purchases
- [ ] Artist analytics dashboard
- [ ] Email campaigns to segmented waitlist
- [ ] Social sharing on artist pages
- [ ] Embed player for external sites
- [ ] Content ID scanning for admin-hosted files
