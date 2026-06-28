# Project Schedule
**Cerberus Live Studio**
Document ID: CLS-PMD-004
Version: 1.0
Date: 2026-06-28
Project Manager: Francisco De La Paz

---

## Summary Timeline

| Stage | Phase | Hours | Status |
|---|---|---|---|
| Stage 1 | Phase 0: Waitlist | 36.5 (actual) | Complete |
| Stage 2 | Phase 1: MVP Platform | 60 | Not started |
| Stage 3 | Phase 2: Media Vault | 70 | Not started |
| Stage 4 | Phase 3: Live Room and Venues | 65 | Not started |
| Stage 5 | Phase 4: Booking Layer | 45 | Not started |
| Stage 6 | Phase 5: Cerberus Managed | 50 | Not started |
| Stage 7 | Phase 6: Monetization and Growth | 45 | Not started |
| Ongoing | Project Management | 15 | Ongoing |
| **Total** | | **386.5** | |

Dates are self-imposed targets driven by personal capacity, not external deadlines. They will be adjusted in CHANGELOG when they slip or accelerate.

---

## Phase 0: Waitlist (Complete)

| Date | Milestone |
|---|---|
| 2026-06-28 | Platform planning and ULTRAPLAN authored |
| 2026-06-28 | Turnstile incident on the live waitlist diagnosed and fixed |
| 2026-06-28 | Cloudflare account audited, backed up, and wiped to a clean slate |
| 2026-06-28 | Waitlist rebuilt IaC-style: one-worker, wrangler.jsonc, D1 plus Turnstile |
| 2026-06-28 | Worker deployed, custom domain attached, signup verified live in D1 |
| 2026-06-28 | Project homed at Q:\MTW\cerberuslive and registered in TinkerOps |
| 2026-06-28 | PMP and documentation suite generated |

---

## Phase 1: MVP Platform (Next)

Goal: artist profiles live, shareable, discoverable.

| Sequence | Target Tasks |
|---|---|
| 1 | Resolve open Phase 0 items: clear test row, create GitHub repo and push |
| 2 | Scaffold Next.js 14 app via OpenNext, choose auth provider |
| 3 | Auth flow: sign up, log in, email verify, account roles |
| 4 | Artist profile creation and public artist page at /artist/{slug} |
| 5 | Fan accounts, follows, and the genre discovery feed |
| 6 | Admin dashboard and waitlist-to-invite migration |
| 7 | Resend confirmation emails, Phase 1 validation |

**Phase 1 Gate**
All Phase 1 acceptance criteria in the Scope Statement must pass before Phase 2 begins.

---

## Phase 2: Media Vault

Goal: artists can share music.

| Sequence | Target Tasks |
|---|---|
| 1 | Electron artist agent shell, Windows first |
| 2 | Bundle cloudflared and the local Express server |
| 3 | One-click serve plus tunnel URL auto-registration |
| 4 | Track upload UI, public media player, featured track |
| 5 | Play count tracking, R2 admin-hosted tier |
| 6 | Phase 2 validation |

**Phase 2 Gate**
A self-hosted track plays on a public profile via the tunnel URL, and the agent installs without admin rights.

---

## Phase 3: Live Room and Venues

Goal: artists can go live, venues can list.

| Sequence | Target Tasks |
|---|---|
| 1 | Live stream window, agent stream output, event scheduling |
| 2 | Central live feed, 10-minute free-tier cap |
| 3 | Manual approval flow, report button on every stream |
| 4 | Venue profiles, territory claims, geographic discovery |
| 5 | Phase 3 validation |

---

## Phase 4: Booking Layer

Goal: venues can find and book artists. Acquisition-ready on completion.

| Sequence | Target Tasks |
|---|---|
| 1 | Availability calendar and booking request form |
| 2 | Accept, decline, counter flow plus messaging thread |
| 3 | Book This Artist, Request a Live Set, Invite to Venue buttons |
| 4 | Venue discovery dashboard, Phase 4 validation |

**Phase 4 Gate: Acquisition-ready**
Target 500 or more active artist profiles, recurring MRR, and a live booking pipeline.

---

## Phase 5: Cerberus Managed

Goal: MTW as booking agent.

| Sequence | Target Tasks |
|---|---|
| 1 | Managed badge, contract creation and tracking |
| 2 | Commission tracking per booking, showcase tools |
| 3 | Open performer slots, ticket minimums, sponsorship tracking |
| 4 | Artist reporting, press kit export, Phase 5 validation |

---

## Phase 6: Monetization and Growth

Goal: revenue on.

| Sequence | Target Tasks |
|---|---|
| 1 | Stripe billing, R2 storage billing, live time extensions |
| 2 | Artist analytics, email campaigns |
| 3 | Social sharing, embed player, Content ID scanning |
| 4 | Phase 6 validation |

---

## Notes

The schedule is sequenced rather than calendar-dated because velocity is set by personal capacity across concurrent MTW work. Each phase is gated: its acceptance criteria from the Scope Statement must pass before the next phase opens. Hour figures are estimates at $85/hr; actuals are recorded in the WBS Actual Hours Log and reconciled at each checkpoint.
