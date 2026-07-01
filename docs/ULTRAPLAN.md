# Cerberus Live Studio — Ultraplan
**Project:** cerberuslive.studio  
**Owner:** Francisco De La Paz / Mad Tinker's Workshop (MTW)  
**Entity:** 4Kings Enterprises  
**Date:** 2026-06-28  
**Status:** Waitlist live. Platform in planning.

---

## Vision

A creator platform for underground artists, DJs, and performers. Not a streaming service. Not social media. A professional identity and booking layer that puts the artist in control of their own infrastructure.

Three heads, one platform:
- **Profile**: Artist identity, bio, genre, photos, links
- **Media**: Self-hosted music vault, video clips, live streaming
- **Booking**: Availability calendar, booking requests, venue discovery

Differentiator: Artists self-host their own media via Cloudflare Tunnel. The platform is the directory and social layer, not the storage. Optional cloud storage for artists who want always-on.

---

## Business Model

### Platform Tiers

| Tier | What They Get | Price |
|------|--------------|-------|
| Free Profile | Public artist page, bio, links, genre tags, fan follows | $0 |
| Creator Vault | Self-host music, clips, media via tunnel or R2 | TBD |
| Live Room | Stream window, event schedule, 10-min cap | TBD |
| Booking Ready | Availability calendar, booking request form, territory claim | TBD |
| Cerberus Managed | Full agent service, priority placement, active promotion | $75/month + commission |

Fan and listener accounts are free. Venue profiles are free to list.

### Cerberus Managed — Commission Structure

| Scenario | Who Pays | Rate | Notes |
|----------|----------|------|-------|
| Artist hires you to find gigs | Artist | 17.5% per booking | You do the legwork, cold call venues, pitch, negotiate |
| Venue comes to you wanting talent | Venue | 12.5% on top of artist fee | They came to you, easier placement |
| You promote a showcase | Split | 20% you / 80% artists | Costs come out of your 20% first |
| Open platform performer slot | Artist | $250 flat OR 25 ticket minimum | Non-managed artists buying into your showcase |

### Cerberus Managed — What $75/Month Covers
- Active pitching to venues on artist's behalf
- Social media promotion
- Negotiation and contract handling
- Calendar and booking management
- Priority placement when venues search the platform
- First right of refusal on showcase slots

### Showcase / Promotion Model
- Cover all costs first from door before split kicks in
- Managed artists get weighted split based on draw and popularity
- Open platform artists pay $250 flat or guarantee 25 tickets sold minimum
- Ticket minimum is preferred, since if they sell 30 tickets at $15 that's $450, better than flat fee
- Sponsorship from local businesses can cover base costs before a ticket sells

### Revenue Streams
1. Platform tier subscriptions (SaaS)
2. Cerberus Managed retainer ($75/month per managed artist)
3. Booking commissions (17.5% artist side, 12.5% venue side)
4. Showcase door percentage (20%)
5. Open platform performer fees ($250 or ticket minimum)
6. Cloud storage margin (R2 passthrough at markup)
7. Exit: platform acquisition

### Exit / Acquisition Criteria
A buyer gets: codebase, active artist profiles (target 500+), recurring MRR, booking pipeline, brand and domain.
Target range: $50k-$500k depending on traction. Acquisition-ready after Phase 4.

---

## Copyright Strategy

| Scenario | Approach | Liability |
|----------|----------|-----------|
| Self-hosted files | Artist serves from own machine, platform stores URL only | None |
| Admin-hosted files | Indemnity disclaimer on upload, Content ID scanning Phase 6+ | Limited, covered by TOS |
| Live streams | Report button, TOS, no real-time scanning possible | Industry standard |
| Content moderation | Manual Live Room approval, community reports, account termination | Covered by TOS |

---

## Content Policy (enforced at launch)
- No adult content (account termination)
- No hate speech or targeted harassment
- Live Room requires manual approval before activation
- Report button on every stream and profile
- Three strikes: warning, suspension, termination

---

## Platform Architecture

### Frontend
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Auth: Better Auth (self-hosted in the OpenNext Worker)
- Deployment: Cloudflare Pages

### Backend / API
- Runtime: Cloudflare Workers
- Database: Cloudflare D1
- Storage: Cloudflare R2 (admin-hosted tier)
- Email: Resend

### Artist Agent (Desktop App)
- Framework: Electron (Windows first)
- Core: Wraps cloudflared, serves local media files
- UI: One-button go live, one-button serve library
- Output: Tunnel URL registered to artist profile

### Self-Hosted Media Flow
```
Artist machine > cloudflared tunnel > cerberuslive.studio/artist/{slug}/media
                                            |
                                    D1 stores tunnel URL
                                            |
                                    Listener streams direct from artist machine
```

### Admin-Hosted Media Flow (paid tier)
```
Artist uploads > R2 bucket > served via Cloudflare CDN (always-on)
```

---

## Database Schema (D1)

### users
id, email, role (artist/fan/venue/admin), created_at, verified

### artist_profiles
id, user_id, slug, display_name, bio, city, genre_tags, photo_url, social_links, tier, tunnel_url, approved_live, territory_primary, territory_secondary, territory_tertiary, created_at, updated_at

### tracks
id, artist_id, title, duration, file_url, is_self_hosted, play_count, created_at

### live_events
id, artist_id, title, scheduled_at, duration_cap_minutes, stream_url, status (scheduled/live/ended)

### booking_requests
id, venue_id, artist_id, event_date, message, status (pending/accepted/declined), rate_offered, commission_type (artist_side/venue_side), commission_rate, created_at

### managed_contracts
id, artist_id, monthly_rate, commission_rate, start_date, status, territories, created_at

### showcases
id, promoter_id, venue_id, title, event_date, ticket_price, door_split_promoter, door_split_artists, cost_coverage_first, status, created_at

### showcase_artists
id, showcase_id, artist_id, is_managed, fee_type (split/flat/tickets), fee_amount, ticket_minimum, weight

### venues
id, user_id, name, city, capacity, contact, genre_preferences, available_dates, created_at

### follows
id, fan_id, artist_id, created_at

### waitlist (live)
id, email, role, created_at

---

## Phase Map

### Phase 0 — Waitlist (COMPLETE)
- [x] Domain: cerberuslive.studio
- [x] Landing page on Cloudflare Pages
- [x] Waitlist Worker + D1 capturing signups by role
- [x] Logo and brand identity
- [x] hello@ and admin@ email routing to Outlook
- [x] SSL provisioning (propagating)

### Phase 1 — MVP Platform
Goal: Artist profiles live, shareable, discoverable

- [ ] Next.js app scaffolded on Cloudflare Pages
- [ ] Auth (sign up, log in, email verify)
- [ ] Artist profile creation (bio, genre, photo, links)
- [ ] Public artist page at cerberuslive.studio/artist/{slug}
- [ ] Fan accounts (follow an artist)
- [ ] Central discovery feed (browse artists by genre)
- [ ] Admin dashboard (signups, users, approvals)
- [ ] Migrate waitlist emails to user invites
- [ ] Resend confirmation emails on waitlist signup

### Phase 2 — Media Vault
Goal: Artists can share music

- [ ] Artist agent app (Electron, Windows first)
- [ ] Track upload UI on artist dashboard
- [ ] Public media player on artist profile
- [ ] Featured track on profile card
- [ ] Play count tracking
- [ ] R2 admin-hosted tier for always-on storage

### Phase 3 — Live Room + Venues
Goal: Artists can go live, venues can list

- [ ] Live stream window on artist profile
- [ ] Artist agent updated with stream output
- [ ] Event scheduling
- [ ] Central live feed (who's live now, by genre)
- [ ] 10-minute cap on free tier, extended via paid
- [ ] Manual Live Room approval flow
- [ ] Report button on every stream
- [ ] Venue profiles (list space, capacity, dates, genres)
- [ ] Territory claim system (Booking Ready tier)
- [ ] Geographic discovery feed

### Phase 4 — Booking Layer
Goal: Venues can find and book artists

- [ ] Artist availability calendar
- [ ] Booking request form (venue to artist)
- [ ] Accept / decline / counter flow
- [ ] Booking confirmation and messaging thread
- [ ] Book This Artist button
- [ ] Request a Live Set button
- [ ] Invite to Venue button
- [ ] Venue discovery dashboard

### Phase 5 — Cerberus Managed
Goal: MTW as booking agent

- [ ] Managed artist badge on profile
- [ ] Managed contract creation and tracking
- [ ] Commission tracking per booking
- [ ] Showcase creation and management tools
- [ ] Open platform performer slot booking
- [ ] Ticket minimum enforcement
- [ ] Artist reporting (plays, follows, booking history)
- [ ] Press kit PDF export
- [ ] Sponsorship tracking for showcases

### Phase 6 — Monetization and Growth
- [ ] Stripe integration for paid tiers
- [ ] R2 storage billing
- [ ] Live time extension purchases
- [ ] Artist analytics dashboard
- [ ] Email campaigns to segmented waitlist
- [ ] Social sharing on artist pages
- [ ] Embed player for external sites
- [ ] Content ID scanning for admin-hosted files

---

## Artist Agent Design

### Requirements
- Windows first, Mac second
- Single installer, no terminal
- One-click: Start Serving My Music
- One-click: Go Live
- Auto-registers tunnel URL with platform
- Auto-reconnects if tunnel drops
- Shows status: serving / offline / live

### Tech Stack
- Electron + bundled cloudflared binary
- Express.js local server for audio files
- WebSocket to platform API for status sync

### Install Flow (revised 2026-07-01 — device authorization)
1. Download CerberusAgent.exe from cerberuslive.studio (`/api/agent/installer`).
2. Run installer (no admin required).
3. On first launch the agent starts a device-authorization grant (RFC 8628 adapted): it calls
   `POST /api/auth/device`, shows a short user code (XXXX-XXXX), and polls
   `POST /api/auth/device/token` every 5s.
4. The artist opens `cerberuslive.studio/device` in any browser, signs in with magic-link,
   and if they lack a dossier or streaming provisioning the page walks them through those
   inline. They enter the user code and click Approve.
5. On the next poll the agent gets `{ slug, agentKey, tunnelToken, mediaOrigin, platformUrl }`
   and writes them to `%APPDATA%\Cerberus\agent.json`.
6. Artist picks music folder in the agent.
7. Click Go live; tunnel activates, catalog registers to the artist's dossier.

The revision replaces the original "Log in with Cerberus account" step 3. The device flow
avoids embedding an email input in the desktop wizard and lets the artist approve from any
device (including their phone), matching how GitHub CLI / Anthropic CLI onboard.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind, TypeScript |
| Auth | Better Auth (self-hosted in the OpenNext Worker) |
| API | Cloudflare Workers |
| Database | Cloudflare D1 |
| Media Storage | Cloudflare R2 |
| Self-hosted Media | cloudflared tunnel + Electron agent |
| Email | Resend |
| Payments | Stripe |
| Domain/CDN | Cloudflare |
| Deployment | Cloudflare Pages + Workers |
| Live Streaming | WebRTC or RTMP via tunnel |
| Artist Agent | Electron + bundled cloudflared |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Artist PC offline kills stream | High | High | R2 fallback tier, clear UX warnings |
| Residential upload speeds cause buffering | Medium | High | 10-min cap, quality selector, R2 fallback |
| Adult content on live stream | Medium | High | Manual approval, report button, TOS |
| Agent too complex for non-tech users | Medium | High | Electron UI, zero terminal, one-click |
| Copyright claim on admin-hosted files | Low | Medium | Indemnity TOS, DMCA process |
| Low artist adoption | Medium | High | Email waitlist, Cerberus Managed as hook |
| Showcase costs exceed 20% door | Medium | Medium | Cover costs first, ticket minimums, sponsorship |

---

## PMI Artifact Log

| Artifact | Phase | Hours | Role |
|----------|-------|-------|------|
| Project Charter | 0 | 2 | Project Manager |
| Stakeholder Register | 0 | 1 | Project Manager |
| Risk Register | 1 | 2 | Project Manager |
| WBS | 1 | 3 | Project Manager |
| Architecture Document | 1 | 4 | Solutions Architect |
| Database Schema | 1 | 3 | Backend Engineer |
| Business Model Document | 0 | 2 | Project Manager |
| Artist Agent Design | 2 | 4 | Software Engineer |
| TOS / Content Policy | 1 | 2 | Project Manager |
| Commission Structure Document | 0 | 1 | Project Manager |

Billing rate: $85/hr across all roles.

---

## Next Action

Start Phase 1. Scaffold Next.js app on TINKERSWORKSHOP via Claude Code.

```
npx create-next-app@latest cerberus-platform --typescript --tailwind --app
```
