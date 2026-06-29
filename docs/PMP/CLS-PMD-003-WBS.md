# Work Breakdown Structure
**Cerberus Live Studio**
Document ID: CLS-PMD-003
Version: 1.0
Date: 2026-06-28
Project Manager: Francisco De La Paz

---

## WBS Structure

### 1.0 Cerberus Live Studio Project

---

#### 1.1 Stage 1: Phase 0 Waitlist

| ID | Task | Status |
|---|---|---|
| 1.1.1 | Register domain cerberuslive.studio | Complete |
| 1.1.2 | Landing page and brand identity (logo) | Complete |
| 1.1.3 | Waitlist Worker plus D1 capturing signups by role | Complete |
| 1.1.4 | hello@ and admin@ email routing to Outlook | Complete |
| 1.1.5 | SSL provisioning | Complete |
| 1.1.6 | One-worker IaC relaunch (wrangler.jsonc, D1 plus assets bindings) | Complete |
| 1.1.7 | Turnstile bot protection wired and verified end to end | Complete |
| 1.1.8 | Project homed at Q:\MTW\cerberuslive and registered in TinkerOps | Complete |
| 1.1.9 | Platform planning: ULTRAPLAN, business model, commission structure | Complete |
| 1.1.10 | Architecture and D1 schema design | Complete |
| 1.1.11 | Documentation and PMP suite generated | Complete |
| 1.1.12 | Clear test waitlist row before public launch | Open |
| 1.1.13 | Create GitHub repo and push IaC relaunch | Complete |

---

#### 1.2 Stage 2: Phase 1 MVP Platform

| ID | Task | Status |
|---|---|---|
| 1.2.1 | Scaffold Next.js 15.5 app on Cloudflare Workers via OpenNext | Complete |
| 1.2.2 | Auth provider chosen: Better Auth (self-hosted in the OpenNext Worker) | Complete |
| 1.2.3 | Auth: sign up, log in, email verify (Better Auth magic-link via Resend) | Complete |
| 1.2.4 | Account roles: artist, fan, venue, admin (admin role control built) | Complete |
| 1.2.5 | Artist profile creation (self-serve claim from /account, linked to user_id) | Complete |
| 1.2.6 | Public artist page at /artist/{slug} | Complete |
| 1.2.13 | Artist dossier page v1: rich SSR /artist/{slug}, data-driven with graceful degradation, schema expansion + STCO seed | Complete |
| 1.2.14 | Port the real Cerberus landing (brand hero, pillars, discovery) to the Next home route | Complete |
| 1.2.15 | Better Auth integration: D1 tables, magic-link via Resend, /login, /account, self-serve profile claim | Complete |
| 1.2.7 | Fan accounts and follow system | Complete |
| 1.2.8 | Central discovery feed, search + browse by genre | Complete |
| 1.2.9 | Admin dashboard (review moderation, verify/gate, tunnel visibility, bookings) | Complete |
| 1.2.16 | Media playback (first-party audio streaming via self-host tunnel) + /api/agent/register | Complete |
| 1.2.17 | Bookings backend (in-platform request/message, managed->admin else artist email) | Complete |
| 1.2.18 | Reviews + earned verification (admin-moderated, completed-booking + approved-review) | Complete |
| 1.2.19 | Agent-key UI + tunnel status in /account | Complete |
| 1.2.20 | Profile editor: performance profile + availability (nested self-serve fields) | Complete |
| 1.2.21 | Negative-review escalation + booking-gate enforcement (warn -> remove booking) | Complete |
| 1.2.22 | Owner/admin password login (Better Auth username plugin, /login dual-mode) | Complete |
| 1.2.23 | Artist photo upload (R2 upload + serve route, editor control) | Complete |
| 1.2.24 | Admin dashboard build-out: users + role control, platform stats, waitlist + CSV export, artist suspend/feature/delete | Complete |
| 1.2.25 | Dossier enrichment: Artist DNA radar (SVG) + Artist Traits/Signature Sounds/Influences sections, render + editor + API, stored in profile_json | Complete |
| 1.2.26 | Control deck redesign: tabbed admin (Overview/Managed/Roster/Fans/Venues/Inbox), metric bar (owner excluded), sortable tables, expandable controls, tier promote/demote, artist + fan detail pages | Complete |
| 1.2.27 | Support inbox + contact: migration 0011 support_messages, /contact intake form, Inbox queue (resolve/reply via Resend), contact-a-user from detail pages | Complete |
| 1.2.28 | Controldeck subdomain auth scaffold: host-gating (lib/host.ts) + relocated owner login (/admin/login); subdomain + Cloudflare Access + TOTP still operator/PC pending | Open |
| 1.2.29 | Status-field consolidation (verified trio -> single source) + booking activity metrics + admin BCC on non-managed bookings | Complete |
| 1.2.10 | Migrate waitlist emails to platform invites | Pending |
| 1.2.11 | Resend confirmation emails on waitlist signup | Pending |
| 1.2.12 | Phase 1 validation: acceptance criteria verified | Pending |

---

#### 1.3 Stage 3: Phase 2 Media Vault

| ID | Task | Status |
|---|---|---|
| 1.3.1 | Artist agent app (Tauri v2, Windows first): branded setup wizard + must-stay-running disclaimer | Complete |
| 1.3.2 | Agent: bundle cloudflared and local Range server | Complete |
| 1.3.3 | Agent: one-click serve, publish-to-Cerberus, tunnel URL auto-registration | Complete |
| 1.3.4 | Track upload UI on artist dashboard (admin-hosted R2 tier, separate paid option) | Pending |
| 1.3.5 | Public media player on artist profile | Complete |
| 1.3.6 | Featured track on profile card | Complete |
| 1.3.7 | Play count tracking | Complete |
| 1.3.8 | R2 admin-hosted always-on storage tier | Pending |
| 1.3.9 | Phase 2 validation: acceptance criteria verified | Pending |
| 1.3.10 | Media Gateway worker (cerberus-media): R2 read-through cache over hidden 2-level per-artist tunnel origins, Range-aware | Complete |
| 1.3.11 | Self-serve named-tunnel provisioning (cf-tunnel CF API, /api/agent/provision, /account "Set up streaming") | Complete |
| 1.3.12 | Agent named token-mode: cloudflared tunnel run --token (Bun engine + Tauri desktop) | Complete |
| 1.3.13 | Gateway deploy + live media verification (deployed; provision + 206 stream + R2 cache verified on prod) | Complete |

---

#### 1.4 Stage 4: Phase 3 Live Room and Venues

| ID | Task | Status |
|---|---|---|
| 1.4.1 | Live stream window on artist profile | Pending |
| 1.4.2 | Artist agent updated with stream output | Pending |
| 1.4.3 | Event scheduling | Pending |
| 1.4.4 | Central live feed, who is live now by genre | Pending |
| 1.4.5 | 10-minute cap on free tier, extended via paid | Pending |
| 1.4.6 | Manual Live Room approval flow | Pending |
| 1.4.7 | Report button on every stream | Pending |
| 1.4.8 | Venue profiles (space, capacity, dates, genres) | Pending |
| 1.4.9 | Territory claim system (Booking Ready tier) | Pending |
| 1.4.10 | Geographic discovery feed | Pending |
| 1.4.11 | Phase 3 validation: acceptance criteria verified | Pending |

---

#### 1.5 Stage 5: Phase 4 Booking Layer

| ID | Task | Status |
|---|---|---|
| 1.5.1 | Artist availability calendar | Pending |
| 1.5.2 | Booking request form, venue to artist | Pending |
| 1.5.3 | Accept, decline, counter flow | Pending |
| 1.5.4 | Booking confirmation and messaging thread | Pending |
| 1.5.5 | Book This Artist button | Pending |
| 1.5.6 | Request a Live Set button | Pending |
| 1.5.7 | Invite to Venue button | Pending |
| 1.5.8 | Venue discovery dashboard | Pending |
| 1.5.9 | Phase 4 validation: acquisition-ready milestone verified | Pending |

---

#### 1.6 Stage 6: Phase 5 Cerberus Managed

| ID | Task | Status |
|---|---|---|
| 1.6.1 | Managed artist badge on profile | Pending |
| 1.6.2 | Managed contract creation and tracking | Pending |
| 1.6.3 | Commission tracking per booking (17.5 artist, 12.5 venue) | Pending |
| 1.6.4 | Showcase creation and management tools | Pending |
| 1.6.5 | Open platform performer slot booking | Pending |
| 1.6.6 | Ticket minimum enforcement | Pending |
| 1.6.7 | Artist reporting (plays, follows, booking history) | Pending |
| 1.6.8 | Press kit PDF export | Pending |
| 1.6.9 | Sponsorship tracking for showcases | Pending |
| 1.6.10 | Phase 5 validation: acceptance criteria verified | Pending |

---

#### 1.7 Stage 7: Phase 6 Monetization and Growth

| ID | Task | Status |
|---|---|---|
| 1.7.1 | Stripe integration for paid tiers | Pending |
| 1.7.2 | R2 storage billing | Pending |
| 1.7.3 | Live time extension purchases | Pending |
| 1.7.4 | Artist analytics dashboard | Pending |
| 1.7.5 | Email campaigns to segmented waitlist | Pending |
| 1.7.6 | Social sharing on artist pages | Pending |
| 1.7.7 | Embed player for external sites | Pending |
| 1.7.8 | Content ID scanning for admin-hosted files | Pending |
| 1.7.9 | Phase 6 validation: revenue on, acceptance verified | Pending |

---

#### 1.8 Project Management (ongoing)

| ID | Task | Status |
|---|---|---|
| 1.8.1 | Maintain BUGS.md, log and close issues | Ongoing |
| 1.8.2 | Maintain CHANGELOG.md, document all changes | Ongoing |
| 1.8.3 | Update ROADMAP.md checkboxes per phase completion | Ongoing |
| 1.8.4 | Obsidian journal entries per work block | Ongoing |
| 1.8.5 | GitHub commits per work block | Ongoing |
| 1.8.6 | PMP document updates at each phase gate | Ongoing |

---

## Estimated Hours by Stage

| Stage | Phase | Estimated Hours |
|---|---|---|
| 1.1 | Phase 0 Waitlist | 36.5 (actual) |
| 1.2 | Phase 1 MVP Platform | 60 |
| 1.3 | Phase 2 Media Vault | 70 |
| 1.4 | Phase 3 Live Room and Venues | 65 |
| 1.5 | Phase 4 Booking Layer | 45 |
| 1.6 | Phase 5 Cerberus Managed | 50 |
| 1.7 | Phase 6 Monetization and Growth | 45 |
| 1.8 | Project Management (ongoing) | 15 |
| **Total** | | **386.5** |

Phase 0 is recorded at its actual 36.5 hours. Phases 1 through 6 and ongoing project management are forward estimates at $85/hr, totaling 350 estimated hours, for a project total of 386.5 hours.

---

## Actual Hours Log

Seeded from docs/HOURS.md, extended at checkpoint. 147.5 hours to date at $85/hr (approximately $12,537.50).

| Date | Work Package | Role | Hours |
|---|---|---|---|
| 2026-06-28 | Turnstile incident fix | Lead Developer | 2.0 |
| 2026-06-28 | Turnstile incident fix | QA Engineer | 0.5 |
| 2026-06-28 | Cloudflare account audit, wipe, backup, clean slate | Deployment Engineer | 2.5 |
| 2026-06-28 | Cloudflare teardown architecture | Solutions Architect | 1.0 |
| 2026-06-28 | IaC and stack architecture (OpenNext, one-worker, monorepo) | Solutions Architect | 1.5 |
| 2026-06-28 | Planning and scope reconciliation | Project Manager | 1.0 |
| 2026-06-28 | cerberuslive scaffold and worker refactor | Lead Developer | 1.5 |
| 2026-06-28 | Project homing, registry, README | Technical Writer | 0.5 |
| 2026-06-28 | Rebuild and relaunch (D1, Turnstile, deploy, domain) | Deployment Engineer | 1.5 |
| 2026-06-28 | Live end-to-end verification | QA Engineer | 0.5 |
| Pre-session | Project Charter | Project Manager | 2.0 |
| Pre-session | Stakeholder Register | Project Manager | 1.0 |
| Pre-session | Risk Register | Project Manager | 2.0 |
| Pre-session | WBS | Project Manager | 3.0 |
| Pre-session | Architecture Document | Solutions Architect | 4.0 |
| Pre-session | Database Schema | Backend Engineer | 3.0 |
| Pre-session | Business Model Document | Project Manager | 2.0 |
| Pre-session | Artist Agent Design | Software Engineer | 4.0 |
| Pre-session | TOS and Content Policy | Project Manager | 2.0 |
| Pre-session | Commission Structure Document | Project Manager | 1.0 |
| 2026-06-28 | Next and OpenNext scaffold (version-trap, Windows debugging) | Lead Developer | 2.5 |
| 2026-06-28 | Stack and CI architecture decisions | Solutions Architect | 1.5 |
| 2026-06-28 | CI pipeline (GitHub Actions) and Resend setup | Deployment Engineer | 2.0 |
| 2026-06-28 | Artist profile pages, home discovery, D1 schema and seed | Lead Developer | 2.5 |
| 2026-06-28 | Deploy and SSR runtime verification | QA Engineer | 1.0 |
| 2026-06-28 | Doc suite formalization (SPEC, VISION, ROADMAP, BUGS, PMP) | Technical Writer | 2.0 |
| 2026-06-28 | WBS and Schedule formalization | Project Manager | 1.0 |
| 2026-06-28 | Artist dossier spec + verification model (brief authoring) | Technical Writer | 0.5 |
| 2026-06-28 | Product decisions: dossier concept, earned-verification flow | Project Manager | 0.5 |
| 2026-06-28 | Local dev environment setup and verification | Deployment Engineer | 0.5 |
| 2026-06-28 | Dossier data model: schema migration 0002, profile_json, graceful-degradation design | Solutions Architect | 1.5 |
| 2026-06-28 | Dossier page build: 12 components, page assembly, db layer, theme tuning | Lead Developer | 4.0 |
| 2026-06-28 | Dossier QA: tsc, next build, local visual (full/partial/sparse, desktop/mobile) | QA Engineer | 1.0 |
| 2026-06-28 | CHANGELOG and checkpoint docs | Technical Writer | 0.5 |
| 2026-06-28 | Dossier scope from brief, ledger reconciliation | Project Manager | 0.5 |
| 2026-06-28 | Landing page port to Next home (brand hero, pillars, discovery, logo) | Lead Developer | 1.5 |
| 2026-06-28 | features.config.ts territoryClaims typo fix + BUGS close | Lead Developer | 0.25 |
| 2026-06-28 | Home QA (tsc, build, visual desktop) | QA Engineer | 0.25 |
| 2026-06-28 | Better Auth architecture (per-request D1 factory, D1 dialect discovery, schema) | Solutions Architect | 1.5 |
| 2026-06-28 | Better Auth build (config, route, client, /login, /account, profile-claim route, migration 0003) | Lead Developer | 3.5 |
| 2026-06-28 | Auth secrets wiring (RESEND_KEY + BETTER_AUTH_SECRET, local + web worker) | Deployment Engineer | 0.5 |
| 2026-06-28 | Auth end-to-end QA (magic-link, session, profile claim, local data cleanup) | QA Engineer | 1.0 |
| 2026-06-28 | Auth provider decision reconciliation across SPEC/ULTRAPLAN/WBS/Schedule/BUGS | Technical Writer | 0.5 |
| 2026-06-28 | Media playback architecture (tunnel streaming, schema 0004) | Solutions Architect | 0.5 |
| 2026-06-28 | Media playback build (AudioPlayer, MediaList, /api/agent/register, wiring) | Lead Developer | 2.0 |
| 2026-06-28 | Bookings backend (/api/bookings, form, managed routing) | Lead Developer | 1.5 |
| 2026-06-28 | Follow system (schema 0005, /api/follow, FollowButton, /following) | Lead Developer | 1.5 |
| 2026-06-28 | Agent-key UI + tunnel status (/account, /api/agent/key) | Lead Developer | 1.0 |
| 2026-06-28 | Reviews + admin moderation architecture (schema 0006, earned verification) | Solutions Architect | 0.5 |
| 2026-06-28 | Reviews + admin build (/api/reviews, /admin, /api/admin/*, AdminConsole) | Lead Developer | 2.5 |
| 2026-06-28 | Dossier/socials alignment (media first-party, Follow, header) | Lead Developer | 0.5 |
| 2026-06-28 | Cloudflare inventory + email routing design | Deployment Engineer | 0.5 |
| 2026-06-28 | End-to-end QA (media, bookings, follow, reviews, admin, routing) | QA Engineer | 1.5 |
| 2026-06-28 | CHANGELOG + checkpoint docs | Technical Writer | 0.5 |
| 2026-06-28 | Discovery search + genre filter (DiscoveryGrid, home) | Lead Developer | 1.0 |
| 2026-06-28 | Profile editor: performance profile + availability (self-serve nested fields) | Lead Developer | 1.5 |
| 2026-06-28 | Negative-review escalation + booking-gate enforcement | Lead Developer | 1.0 |
| 2026-06-28 | Play-count tracking (migration 0007, /api/tracks/play, display) | Lead Developer | 0.5 |
| 2026-06-29 | Named-tunnel PoC (origin server, token run, openssl TLS diagnosis) | Deployment Engineer | 1.5 |
| 2026-06-29 | Root-cause + Media Gateway architecture (R2 read-through, hidden 2-level origins, host-pattern decision) | Solutions Architect | 2.5 |
| 2026-06-29 | Gateway worker cerberus-media (D1 lookup, R2 Range cache, size-gate stream-through) | Lead Developer | 3.0 |
| 2026-06-29 | Migration 0008 schema design | Solutions Architect | 0.5 |
| 2026-06-29 | Gateway tests + wrangler-dev environment triage (8 bun tests) | QA Engineer | 1.5 |
| 2026-06-29 | Frontend cutover (trackUrl/MediaCtx refactor, callers, scrub) | Lead Developer | 1.5 |
| 2026-06-29 | SSR verification + RSC origin-leak detection and fix | QA Engineer | 1.0 |
| 2026-06-29 | Provisioning: cf-tunnel.ts (CF API), /api/agent/provision, /account UI | Lead Developer | 3.0 |
| 2026-06-29 | Provisioning flow + idempotency design | Solutions Architect | 0.5 |
| 2026-06-29 | Agent named token-mode (register named-mode + Bun engine + Tauri Rust + React) | Lead Developer | 2.5 |
| 2026-06-29 | Cross-repo build verification (cargo check, tsc, bun-build) | QA Engineer | 0.5 |
| 2026-06-29 | Docs (MEDIA-GATEWAY-PLAN, media README, config, CHANGELOG) | Technical Writer | 1.5 |
| 2026-06-29 | Operator deploy sequencing + ledger steps | Deployment Engineer | 0.5 |
| 2026-06-29 | Artist photo upload: R2 binding, upload + serve routes, editor control | Lead Developer | 2.0 |
| 2026-06-29 | Photo upload QA (binding, serve 404, tsc) | QA Engineer | 0.5 |
| 2026-06-29 | Owner/admin auth design (email+password + username plugin alongside magic-link) | Solutions Architect | 1.0 |
| 2026-06-29 | Owner/admin auth build (auth.ts, client, /login dual-mode, migration 0009) | Lead Developer | 2.0 |
| 2026-06-29 | Auth QA (signup/signin/wrong-pw/role-grant round-trip) | QA Engineer | 1.0 |
| 2026-06-29 | /account/edit 500 fix (sparse-dossier repro, WEEK client-module root cause) | Lead Developer | 1.0 |
| 2026-06-29 | Media gateway go-live (R2 buckets, custom domain deploy, CF token scoping, secrets, TLS) | Deployment Engineer | 2.5 |
| 2026-06-29 | Media QA (live provision, 206 + R2 cache, DNS resolution) | QA Engineer | 1.0 |
| 2026-06-29 | Prod virgin wipe + owner bring-up (cleanup-all, migrations to prod, seed, reseed, CI) | Deployment Engineer | 2.0 |
| 2026-06-29 | Admin build-out (users+role API, stats, waitlist+CSV, suspend/feature/delete, enforcement, migration 0010, console) | Lead Developer | 3.5 |
| 2026-06-29 | Admin QA (sections render, suspend->404, last-admin 409, prod verify) | QA Engineer | 1.0 |
| 2026-06-29 | Admin data model + enforcement design | Solutions Architect | 0.5 |
| 2026-06-29 | CHANGELOG + docs (round 2) | Technical Writer | 0.5 |
| 2026-06-29 | Dossier enrichment data model + radar geometry/layout design (reuse profile_json no-migration, 6-axis viewBox sizing, graceful-degradation card flow) | Solutions Architect | 1.0 |
| 2026-06-29 | Artist DNA radar (SVG) + Traits/Signature Sounds/Influences (render cards, editor controls, /api/profile/update clamp + persist) | Lead Developer | 2.5 |
| 2026-06-29 | Enrichment QA (tsc, eslint, live preview render, local D1 seed-verify, screenshot review) | QA Engineer | 1.0 |
| 2026-06-29 | CHANGELOG + checkpoint docs (round 3) | Technical Writer | 0.5 |
| 2026-06-29 | Admin IA + controldeck subdomain/2FA/Access + booking-model + status-consolidation design | Solutions Architect | 3.0 |
| 2026-06-29 | Admin redesign requirements + scope decisions | Project Manager | 1.5 |
| 2026-06-29 | Controldeck auth scaffold: host-gating, /admin/login owner sign-in, public login kept (1.2.28) | Lead Developer | 1.5 |
| 2026-06-29 | Control deck redesign: AdminConsole rebuild + metrics queries + artist/fan detail pages (1.2.26) | Lead Developer | 5.5 |
| 2026-06-29 | Support inbox + contact: migration 0011, mail.ts, /api/support + /api/admin/support + /api/admin/contact, /contact form, Inbox queue, ContactUser (1.2.27) | Lead Developer | 3.5 |
| 2026-06-29 | Status-field consolidation + booking activity metrics + admin BCC (1.2.29) | Lead Developer | 1.5 |
| 2026-06-29 | Admin build QA (preview verification all phases, tsc/eslint, local D1 seed/teardown) | QA Engineer | 2.5 |
| 2026-06-29 | ADMIN-CONTROLDECK-PLAN.md authoring + checkpoint docs (round 4) | Technical Writer | 1.5 |
| **Total** | | | **147.5** |
