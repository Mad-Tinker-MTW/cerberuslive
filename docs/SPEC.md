# Cerberus Live Studio — Specification
**Cerberus Live Studio**
Version: 0.1.0

---

## What It Is

A creator platform for underground artists, DJs, and performers. Not a streaming service, not social media. A professional identity and booking layer that puts the artist in control of their own infrastructure. The platform is the directory and social layer, not the storage: artists self-host their own media via Cloudflare Tunnel, with an optional cloud tier for those who want always-on availability.

Three heads, one platform: Profile, Media, and Booking.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15.5 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Auth | Better Auth (self-hosted in the OpenNext Worker) |
| API | Cloudflare Workers |
| Database | Cloudflare D1 |
| Media storage | Cloudflare R2 (admin-hosted tier) |
| Self-hosted media | cloudflared tunnel + Electron agent |
| Email | Resend |
| Payments | Stripe |
| Bot protection | Cloudflare Turnstile |
| Domain / CDN | Cloudflare |
| Deployment | Cloudflare Pages + Workers (Next.js via OpenNext adapter) |
| Live streaming | WebRTC or RTMP via tunnel |
| Artist agent | Electron + bundled cloudflared |
| Package manager | bun |

The current waitlist runs as a single Cloudflare Worker that serves the static landing page via the ASSETS binding and handles `POST /api/waitlist`. The full platform deploys Next.js to Workers through the OpenNext adapter.

---

## Data Model (Cloudflare D1)

### users
- id, email, role, created_at, verified
- role: artist, fan, venue, admin

### artist_profiles
- id, user_id, slug, display_name, bio, city, genre_tags, photo_url, social_links, tier, tunnel_url, approved_live, territory_primary, territory_secondary, territory_tertiary, created_at, updated_at

### tracks
- id, artist_id, title, duration, file_url, is_self_hosted, play_count, created_at

### live_events
- id, artist_id, title, scheduled_at, duration_cap_minutes, stream_url, status
- status: scheduled, live, ended

### booking_requests
- id, venue_id, artist_id, event_date, message, status, rate_offered, commission_type, commission_rate, created_at
- status: pending, accepted, declined
- commission_type: artist_side, venue_side

### managed_contracts
- id, artist_id, monthly_rate, commission_rate, start_date, status, territories, created_at

### showcases
- id, promoter_id, venue_id, title, event_date, ticket_price, door_split_promoter, door_split_artists, cost_coverage_first, status, created_at

### showcase_artists
- id, showcase_id, artist_id, is_managed, fee_type, fee_amount, ticket_minimum, weight
- fee_type: split, flat, tickets

### venues
- id, user_id, name, city, capacity, contact, genre_preferences, available_dates, created_at

### follows
- id, fan_id, artist_id, created_at

### waitlist (live)
- id, email, role, created_at

---

## Platform Tiers

| Tier | What They Get | Price |
|---|---|---|
| Free Profile | Public artist page, bio, links, genre tags, fan follows | $0 |
| Creator Vault | Self-host music, clips, media via tunnel or R2 | TBD |
| Live Room | Stream window, event schedule, 10-min cap | TBD |
| Booking Ready | Availability calendar, booking request form, territory claim | TBD |
| Cerberus Managed | Full agent service, priority placement, active promotion | $75/month + commission |

Fan and listener accounts are free. Venue profiles are free to list.

---

## Media Architecture

### Self-hosted flow (default)
```
Artist machine > cloudflared tunnel > cerberuslive.studio/artist/{slug}/media
                                            |
                                    D1 stores tunnel URL
                                            |
                                    Listener streams direct from artist machine
```

### Admin-hosted flow (paid tier)
```
Artist uploads > R2 bucket > served via Cloudflare CDN (always-on)
```

The platform stores only the tunnel URL for self-hosted artists, which keeps copyright liability with the artist serving the file. The admin-hosted tier carries an indemnity disclaimer on upload and adds Content ID scanning in Phase 6.

---

## Modules

| Module | Phase | Status |
|---|---|---|
| Waitlist capture | 0 | live |
| Auth (sign up, log in, verify) | 1 | planned |
| Artist profile creation | 1 | planned |
| Public artist page | 1 | planned |
| Fan accounts and follows | 1 | planned |
| Discovery feed | 1 | planned |
| Admin dashboard | 1 | planned |
| Track upload and media player | 2 | planned |
| Artist agent (Electron) | 2 | planned |
| R2 admin-hosted tier | 2 | planned |
| Live Room and stream window | 3 | planned |
| Venue profiles | 3 | planned |
| Territory claims | 3 | planned |
| Availability calendar | 4 | planned |
| Booking request flow | 4 | planned |
| Managed contracts | 5 | planned |
| Showcase tools | 5 | planned |
| Stripe billing | 6 | planned |
| Artist analytics | 6 | planned |

---

## Artist Agent (Desktop App)

A single-installer Electron app, Windows first, that wraps a bundled cloudflared binary and an Express.js local server for audio files. It exposes one-click Start Serving My Music and Go Live actions, auto-registers the tunnel URL with the artist profile via a WebSocket to the platform API, auto-reconnects if the tunnel drops, and shows status as serving, offline, or live. No terminal, no admin rights required.

Install flow: download CerberusAgent.exe, run installer, log in with Cerberus account, pick a music folder, click Start. The tunnel activates and the URL registers to the profile.

---

## Feature Flags

Phased rollout is gated by `features.config.ts`. Each flag flips to true as its phase ships. Phase 1 flags are scaffolded true (artistProfiles, fanAccounts, discoveryFeed, adminDashboard, waitlistInvites); emailConfirmations and everything in Phases 2 through 6 are false until built. Import the helper and gate UI on it:

```ts
import { features, isEnabled } from '@/features.config'
isEnabled('liveRoom') ? <LiveRoom /> : <ComingSoon />
```

---

## Content Policy (enforced at launch)

- No adult content, account termination
- No hate speech or targeted harassment
- Live Room requires manual approval before activation
- Report button on every stream and profile
- Three strikes: warning, suspension, termination

---

## Environment

`TURNSTILE_SECRET` must be set on the Worker, or every waitlist signup returns 403 "Bot verification failed". Set it with `bunx wrangler secret put TURNSTILE_SECRET`. The D1 and ASSETS bindings are declared in `wrangler.jsonc`.
