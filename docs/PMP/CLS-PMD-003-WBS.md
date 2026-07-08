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
| 1.2.28 | Controldeck auth: host-gating (lib/host.ts) + relocated owner login (/admin/login) + in-app TOTP 2FA (better-auth two-factor, migration 0012, enrollment at /admin/security, login challenge) | Complete |
| 1.2.29 | Status-field consolidation (verified trio -> single source) + booking activity metrics + admin BCC on non-managed bookings | Complete |
| 1.2.30 | Secure controldeck go-live: custom domain via CF API, prod D1 migrations 0011+0012, Cloudflare Access (email-PIN, owner-only), final lockdown (public /login magic-link only + /admin* controldeck-only). Admin is controldeck-only behind 3 layers | Complete |
| 1.2.31 | Personas/releases data model + type-aware dossier (migration 0013): Artist -> personas (solo/group) -> releases (album/EP/single) -> tracks + direct lane, persona/release dedication, getDiscography assembler, conditional Discography tab render (L-048 Phase 1) | Complete |
| 1.2.32 | Discography full CRUD editor (/account/discography + /api/discography, ownership-checked, deletes orphan child tracks to the direct lane) + roles chips (L-048 Phase 1) | Complete |
| 1.2.33 | Installable PWA: app/manifest.ts (standalone), maskable icon, service worker (network-first nav + offline fallback, no media/API cache), SW registration (L-048 Phase 4) | Complete |
| 1.2.34 | Repeatable admin onboarding (Better Auth admin plugin): admin() + adminClient(), migration 0023 (banned/banReason/banExpires + session.impersonatedBy), control-deck AdminManager UI to create a standalone admin or promote a fan/artist (role + password + username), replacing the one-off owner seed | Complete |
| 1.2.35 | Admin credential lifecycle: self-service Change password card (Security page) + account-recovery Change-user-email-in-place on /admin/artist/[slug] (admin.updateUser; keeps user.id so the artist_profile, tracks, and connected Agent survive untouched) | Complete |
| 1.2.36 | Admin control-deck overhaul: three-tier model (Independent = Free/Plus vs Managed) with per-tier tabs + metric restructure, chip hover tooltips + booking-gate mislabel fix, minimal admin header + logout (drops the public site chrome), dossier preview route (iframe + back bar) + copy-public-link, per-tier + Fans search | Complete |
| 1.2.37 | Server-side admin artist search + pagination (api/admin/artists route, ADMIN_ARTIST_SELECT/SORT/PAGE_SIZE in db.ts) + real-booking counts (kind='booking') + Upcoming column (future accepted, ISO-date guarded) | Complete |
| 1.2.38 | Booking structured-date field (L-064): native type=date picker on the dossier booking form (min=today, dark scheme), /api/bookings normalizes event_date to YYYY-MM-DD else null, and the ISO GLOB guard dropped from the Upcoming subquery (plain event_date >= date('now')) now that stored values are guaranteed ISO or null | Complete |
| 1.2.39 | Per-track cover art + embedded-art reading (L-057): tracks.cover_url (mig 0024) so a single carries its own art (release cover still wins inside an album/EP); selfCoverUrl gateway helper; single render uses its own cover_url; register accepts per-track cover (relative->gateway URL / absolute passthrough). CerberusAgent desktop scan extract_cover pulls embedded APIC to a served .cerberus-covers/ sidecar via ffmpeg + image content-types in the static server | Complete |
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
| 1.3.14 | Video lane (migration 0014 media_kind): video tracks stream through the gateway, render in the Live Sets tab + inline in discography, editor media-kind control, gateway + agent video MIME (L-048 Phase 2) | Complete |
| 1.3.15 | Agent rework (migration 0015 managed_by): recursive/persona-aware scan (folder=persona, ffprobe tag auto-import, video, debounced fs.watch re-sync) + register reconcile (replace only agent tracks, find-or-create personas/releases preserving artist-edited dedications) (L-048 Phase 3) | Complete |
| 1.3.16 | Media gateway tier-realignment: free/self = pure tunnel pass-through (no R2 put), managed = R2 read-through cache; video MIME; +1 test (L-048 Phase 5) | Complete |

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
| 1.4.12 | Live lane (migration 0016 live_sessions): go-live/end with caps, LIVE badge + /live/[slug] watch page, free WebRTC window (Cloudflare Realtime via the token-hiding /api/live/rtc proxy) + managed Stream Live event (input creation + HLS iframe). Presence / watch / caps done + verified; the WebRTC + Stream media path is operator-gated (CF_REALTIME_APP_ID/TOKEN, CF Stream creds) and not yet live-verified (L-048 Phase 6) | Open |
| 1.4.13 | Live watch-page UX: viewer connecting/ended/error states + Report button -> support inbox (/api/report) (L-048 Phase A) | Complete |
| 1.4.14 | Admin live moderation: control-deck Live-now panel + force-end (/api/admin/live) (L-048 Phase A) | Complete |
| 1.4.15 | Live tier caps + weekly-minute budget + bitrate cap (LIVE_TIERS at /api/live start; plus-tier config) (L-048 Phase A) | Complete |
| 1.4.16 | Deferred-follow: capture email mid-show -> confirm link -> email-only follower (migration 0017, /api/follow/intent + /confirm) (L-048 Phase A) | Complete |
| 1.4.17 | Anonymous live reactions (migration 0018, /api/live/react + /reactions, floating ReactionBar via D1 poll) (L-048 Phase A) | Complete |
| 1.4.18 | Concurrent-viewer cap via viewer-heartbeat (migration 0019 live_viewers): /api/live/viewer join/beat/leave enforcing live_sessions.viewer_cap with stale-row purge, admin/owner uncapped bypass; LiveViewer claims a slot before connecting, heartbeats every 10s, releases on unmount, shows a "full" state (L-048 Phase A.6) | Complete |
| 1.4.19 | Remaining-minutes UX in /account: weekly live-budget bar (used/remaining, viewer + session caps) from liveCaps + getWeeklyLiveMinutes; "unmetered" for managed (L-048 Phase B) | Complete |
| 1.4.20 | Performance modes: Stage (music: stereo, voice DSP off) vs Mic (spoken: mono, light NS) from roles; audio-input-device picker + 480p/720p toggle; Opus stereo/bitrate tuning + audio bitrate cap in publishWindow (media path operator-gated) (L-048 Phase B) | Complete |
| 1.4.21 | Profile feed (migration 0020 posts): public + followers-only posts; /api/posts create/delete (ownership-scoped); dossier Feed tab (hidden when empty, followers-only gated server-side); composer + delete in /account (L-048 Phase B) | Complete |
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
| 1.7.1 | Stripe integration for paid tiers: self-managed+ ($29.99/mo) billing (migration 0021) — thin fetch-based Stripe client, /api/billing checkout + portal + signature-verified webhook flipping tier free<->plus, BillingCard upgrade/manage UI. Code complete + deployed; operator wires STRIPE_* secrets + webhook to activate (L-048 Phase 6) | Complete |
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

Seeded from docs/HOURS.md, extended at checkpoint. 230.0 hours to date at $85/hr (approximately $19,550.00).

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
| 2026-06-29 | TOTP 2FA design (better-auth two-factor: enrollment + login-challenge flow) | Solutions Architect | 0.5 |
| 2026-06-29 | TOTP build: plugin wiring, migration 0012, OwnerLoginForm 2FA stage, /admin/security enrollment (1.2.28) | Lead Developer | 2.0 |
| 2026-06-29 | TOTP QA (enroll + re-login-challenge round-trip, RFC-6238 code verify) | QA Engineer | 1.0 |
| 2026-06-29 | Custom-domain root-cause (wizard vs OpenNext, token scopes) + deploy-order/no-lockout sequencing | Solutions Architect | 1.0 |
| 2026-06-29 | Secure controldeck go-live: custom domain via CF API, prod D1 migrations 0011+0012, Cloudflare Access setup, lockdown deploy (1.2.30) | Deployment Engineer | 2.5 |
| 2026-06-29 | Final lockdown code (strip apex owner login + /admin* host-gating across 5 routes) | Lead Developer | 0.5 |
| 2026-06-29 | Prod verification (apex lockdown, Access edge gate, owner+2FA D1 state, host-isolation) | QA Engineer | 1.0 |
| 2026-06-29 | Ledger + registry + checkpoint docs (round 5) | Technical Writer | 0.5 |
| 2026-06-29 | L-048 discography data model + hierarchy design (personas/releases/tracks, dedication) | Solutions Architect | 1.5 |
| 2026-06-29 | L-048 agent-reconcile + gateway-tier + live architecture (managed_by, find-or-create, free vs R2, token-hiding proxy) | Solutions Architect | 3.0 |
| 2026-06-29 | Personas/releases data model + type-aware dossier (migration 0013, getDiscography, Discography render + tab) (1.2.31) | Lead Developer | 3.0 |
| 2026-06-29 | Discography full CRUD editor + /api/discography + roles (1.2.32) | Lead Developer | 3.5 |
| 2026-06-29 | Video lane (migration 0014, VideoList, render, editor media-kind, MIME) (1.3.14) | Lead Developer | 1.5 |
| 2026-06-29 | Agent rework + register reconcile (migration 0015, recursive scan + ffprobe tags + watcher) (1.3.15) | Lead Developer | 3.5 |
| 2026-06-29 | Installable PWA (manifest, service worker, offline, icon, registration) (1.2.33) | Lead Developer | 1.5 |
| 2026-06-29 | Gateway tier-realignment (free pass-through vs managed R2) (1.3.16) | Lead Developer | 1.0 |
| 2026-06-29 | Live lane (migration 0016, /api/live + rtc proxy, realtime-client, LiveControl, LiveViewer, watch page, dossier badge) (1.4.12) | Lead Developer | 4.5 |
| 2026-06-29 | L-048 verification (discography live + CRUD-vs-D1, video, agent reconcile end-to-end + idempotency, PWA, media tests, live surface, full sweep) | QA Engineer | 6.0 |
| 2026-06-29 | Build-status doc + checkpoint docs (round 6) | Technical Writer | 1.0 |
| 2026-06-29 | L-048 phase scoping, dependency sequencing, full-CRUD scope decision | Project Manager | 1.0 |
| 2026-06-29 | L-048 prod deploy (D1 migrations 0013-0016 --remote, tier-aware media worker deploy, web + agent push, CI watch) | Deployment Engineer | 1.0 |
| 2026-06-29 | L-048 prod deploy verification (remote schema check + home/dossier/live/manifest 200) | QA Engineer | 0.5 |
| 2026-06-30 | Live + social + events systems design (tiers, caps, cost model, performance modes, deferred-follow, reactions, moderation, follower-comms, audition funnel) | Solutions Architect | 2.5 |
| 2026-06-30 | Pricing + business model (hybrid managed fee, commission, promote menu, showcase economics, tier value) | Project Manager | 2.5 |
| 2026-06-30 | LIVE-TIERS-AND-PRICING + BUSINESS-MODEL doc authoring | Technical Writer | 1.5 |
| 2026-06-30 | Live SFU path verification (app + secrets, server checks, live camera + phone-viewer test) | QA Engineer | 1.0 |
| 2026-06-30 | SFU app/secrets setup + go-live verification | Deployment Engineer | 0.5 |
| 2026-06-30 | Live Phase A build: watch UX + report, admin Live-now + force-end, tier caps + weekly budget + bitrate, deferred-follow, reactions (5 increments) | Lead Developer | 9.0 |
| 2026-06-30 | Live/social implementation design (deferred-follow model, reactions via D1 poll vs DO, cap mechanics) | Solutions Architect | 1.0 |
| 2026-06-30 | Live Phase A verification (report inbox, force-end SQL, weekly-minute math, deferred-follow flow, reactions data flow, tsc/eslint x5) | QA Engineer | 2.5 |
| 2026-06-30 | Live Phase A deploy (prod migrations 0017-0018, commit, push, CI, prod verification) | Deployment Engineer | 1.0 |
| 2026-06-30 | Checkpoint docs (CHANGELOG, ledger, registry) | Technical Writer | 0.5 |
| 2026-06-30 | Live Phase A.6 build: migration 0019 live_viewers + countActiveViewers helper + /api/live/viewer (join/beat/leave) + LiveViewer heartbeat/full-state wiring | Lead Developer | 3.0 |
| 2026-06-30 | Concurrent-viewer cap + heartbeat mechanics design (stale-reclaim window, admin/owner uncapped bypass) | Solutions Architect | 0.5 |
| 2026-06-30 | Phase A.6 verification (local D1: cap fill->403, leave frees slot, stale reclaim, not-live 409; tsc + eslint) | QA Engineer | 1.0 |
| 2026-06-30 | Phase A.6 deploy (prod D1 migration 0019 --remote, commit e92abd2, push, CI run 28429229700 success, prod smoke) | Deployment Engineer | 0.5 |
| 2026-06-30 | Checkpoint docs round 2 (WBS, CHANGELOG, ROADMAP, ledger, registry, mirror) | Technical Writer | 0.5 |
| 2026-06-30 | Remaining-minutes UX (weekly live-budget bar in /account) | Lead Developer | 0.5 |
| 2026-06-30 | Profile feed (migration 0020 posts + /api/posts + dossier Feed tab + composer + followers-only gating) | Lead Developer | 2.5 |
| 2026-06-30 | Followers-only privacy + feed data model design | Solutions Architect | 0.5 |
| 2026-06-30 | Performance modes (Stage/Mic from roles, device picker, 480/720, Opus tuning + audio cap) | Lead Developer | 2.0 |
| 2026-06-30 | Stage/Mic audio-profile design (DSP off for music, stereo/bitrate) | Solutions Architect | 0.5 |
| 2026-06-30 | Self-managed+ Stripe billing (migration 0021, fetch-based Stripe client, checkout/portal/webhook, BillingCard) | Lead Developer | 3.5 |
| 2026-06-30 | Billing + webhook-signature verification design (tier-flip rules, replay guard) | Solutions Architect | 0.5 |
| 2026-06-30 | Phase B + billing verification (local D1: posts auth-gate + followers-only privacy, billing 503/400 gating, account + dossier render) | QA Engineer | 2.0 |
| 2026-06-30 | Phase B + billing deploy (prod migrations 0020-0021, commit, push, CI, prod smoke) | Deployment Engineer | 1.0 |
| 2026-06-30 | Checkpoint docs round 3 (WBS, CHANGELOG, ROADMAP, ledger, registry, CLAUDE.md, mirror) | Technical Writer | 0.5 |
| 2026-07-07 | Cerberus-line flow plan + two invariants (window/service economics, build/ship native-client) + three frozen contracts + slice order | Solutions Architect | 2.0 |
| 2026-07-07 | CLS near-death investigation (why nearly scrapped): Explore agents + 6/28-7/3 transcript dig + synthesis + claude.ai export ingest into TinkerBrain | Solutions Architect | 1.5 |
| 2026-07-07 | Device-auth onboarding: diagnosed built-but-unpushed (prod 404) -> deploy; CORS root-cause + fix on /api/auth/device + /token (agent Tauri-webview fetch was blocked) | Lead Developer | 1.5 |
| 2026-07-07 | Prod D1 investigation (schema, counts, users, R2 gone) + f-de-la-paz reinstate then delete for a virgin signup + verification | Lead Developer | 1.0 |
| 2026-07-07 | Two prod deploys (device-auth routes + CORS fix) via CI + endpoint verification | Deployment Engineer | 1.0 |
| 2026-07-07 | Fresh-artist no-paste on-ramp end-to-end verify (download -> sign in -> device link -> artist page -> 21 tracks) + discography D1 readout + gap analysis | QA Engineer | 1.0 |
| 2026-07-07 | Discography design: mockup pinned (web/docs/designs/discography.png) + client-editor / add-art / preview-before-publish model | Solutions Architect | 0.5 |
| 2026-07-07 | CerberusAgent installer release CI (release.yml, tauri-action) + v0.4.0 tag build + installer publish + download [Agent work, counted here] | Lead Developer | 1.0 |
| 2026-07-07 | CerberusAgent v0.4.0 installer build/publish + no-paste device-auth verify [Agent work, counted here] | Deployment Engineer | 0.5 |
| 2026-07-07 | Checkpoint docs (WBS, CHANGELOG, registry, ledger, mirror, journal, session report) | Technical Writer | 1.0 |
| 2026-07-07 | Discography render rebuilt to the pinned mockup (worker orchestration + review + merge + deploy; commit b05ee60): featured hero, filter chips, card grid, release detail panel, SSR-safe model | Lead Developer | 1.5 |
| 2026-07-07 | Single-source discography player refactor (worker + review + deploy; commit fd0e8f5): one audio element via PlayerProvider, all Play affordances routed to it (fixed featured+album overlap), waveforms retired, compact mockup now-playing bar | Lead Developer | 1.0 |
| 2026-07-07 | Discography render + player worker specs (single-source design, mockup mapping) | Solutions Architect | 0.5 |
| 2026-07-07 | Cover investigation (X:\Music Album Covers folder) + manual D1 cover_url wiring for 4 EPs + gateway serve verify (200) | Lead Developer | 0.5 |
| 2026-07-07 | Durable cover auto-match worker (Agent cover scan + Content-Type + platform register cover_url + render onError fallback; branches agent-cover-match 359310c / register-cover 612e19b) orchestration + review | Lead Developer | 1.0 |
| 2026-07-07 | Cloudflared console-window hide on Windows (CREATE_NO_WINDOW; Agent commit 95b974e, L-058a) | Lead Developer | 0.5 |
| 2026-07-07 | Two CI prod deploys (discography render, single-source player) + live page verification | Deployment Engineer | 1.0 |
| 2026-07-07 | Live verification (render/player/covers render, gateway cover 200, page 200) | QA Engineer | 1.0 |
| 2026-07-07 | Artist tooling & services consolidation: audited VISION/BUSINESS-MODEL/SPEC (all absent), added flow-plan section + ledger L-060 guardian/provenance, L-061 genre classification, L-062 DistroKid | Solutions Architect | 1.0 |
| 2026-07-07 | Platform stack decision (L-059): rebuild-off-OpenNext vs patch-forward; DECIDED patch-forward with SvelteKit-on-CF escape hatch | Solutions Architect | 0.5 |
| 2026-07-07 | Checkpoint round 2 (headless run: WBS/CHANGELOG/registry/ledger/mirror/journal/report) | Technical Writer / PM | 1.0 |
| 2026-07-07 | Admin account-model diagnosis + prod D1 investigation (identity tangle mad.tinker/mad-tinker/f-de-la-paz, seeding-gap discovery, agent-auth model read) | Solutions Architect | 2.0 |
| 2026-07-07 | Repeatable-admin-onboarding design (admin plugin vs re-seed vs re-identify; verified against installed Better Auth admin schema + endpoint API) (1.2.34) | Solutions Architect | 1.0 |
| 2026-07-07 | Admin plugin build: admin() + adminClient(), AdminManager UI (create/promote), migration 0023 (1.2.34) | Lead Developer | 2.5 |
| 2026-07-07 | Self-service Change password card on the control-deck Security page (1.2.35) | Lead Developer | 1.0 |
| 2026-07-07 | Account-recovery change-user-email-in-place on /admin/artist/[slug] + agent-independence verification (agent_key on profile, not email) (1.2.35) | Lead Developer | 1.0 |
| 2026-07-07 | Admin identity first-run + live verification (promote francisco.delapaz, TOTP enroll, Cloudflare Access allow-list guidance, re-login chain, prod health x3) | QA Engineer | 1.5 |
| 2026-07-07 | Three CI prod deploys + prod migration 0023 (--remote) + deploy-order safety (migration-before-code to avoid getSession lockout) | Deployment Engineer | 1.0 |
| 2026-07-07 | Checkpoint round 3 (admin identity + credential lifecycle: WBS/CHANGELOG/registry/ledger/mirror/journal/report) | Technical Writer / PM | 1.0 |
| 2026-07-07 | Admin offboard: Retire (remove) control (admin.removeUser + self/last-admin guards, commit 0da9102) + mad.tinker retirement + prod-clean verification (users=2, admins=1, 0 orphan account/session/twoFactor rows) (1.2.35) | Lead Developer / QA Engineer | 1.0 |
| 2026-07-08 | Chip hover tooltips (both admin surfaces) + booking-gate mislabel fix (unset gate read as Closed) (1.2.36) | Lead Developer | 1.0 |
| 2026-07-08 | Booking-gate / ACTIVE / SELF / booking-count semantics analysis + operator explanations | Solutions Architect | 0.5 |
| 2026-07-08 | Tier taxonomy design (Independent umbrella; Free/Plus/Managed; industry-term reasoning) (1.2.36) | Solutions Architect | 1.0 |
| 2026-07-08 | Three-tier admin build (Roster->Free->Freelance->tiers, per-tier tabs, metric restructure, tier toggle) (1.2.36) | Lead Developer | 2.5 |
| 2026-07-08 | Per-tier client search + server-side artist search + pagination (api/admin/artists, ADMIN_ARTIST_SELECT, debounced console wiring) (1.2.37) | Lead Developer | 3.5 |
| 2026-07-08 | Booking columns: real-booking kind filter + Upcoming column (event_date ISO GLOB guard) (1.2.37) | Lead Developer | 1.0 |
| 2026-07-08 | Admin dossier preview route (iframe + back bar) + copy-public-link iterations (1.2.36) | Lead Developer | 1.5 |
| 2026-07-08 | Console cleanup: minimal admin header + logout (5-page swap), Fans search, quick-view copy, search placeholder (1.2.36) | Lead Developer | 1.5 |
| 2026-07-08 | Parallel-task orchestration + git reconciliation (untangle uncommitted state, verify scope, merge two spawned tasks) | Solutions Architect | 1.5 |
| 2026-07-08 | ~13 CI prod deploys + apex health verification across the arc | Deployment Engineer | 1.5 |
| 2026-07-08 | Live QA across features (tiers, search, preview, cleanup, tooltips) | QA Engineer | 1.0 |
| 2026-07-08 | Checkpoint round 4 (admin control-deck overhaul: WBS/CHANGELOG/registry/ledger/mirror/journal/report) | Technical Writer / PM | 1.0 |
| 2026-07-08 | Structured-date safety analysis: prod-D1 audit of existing event_date values (zero rows, no backfill), decide whether the ISO GLOB guard can be dropped (L-064) (1.2.38) | Solutions Architect | 0.5 |
| 2026-07-08 | Booking structured-date field: native type=date picker + /api/bookings ISO normalization + drop the Upcoming GLOB guard (1.2.38) | Lead Developer | 1.0 |
| 2026-07-08 | End-to-end verification (form->API->D1->Upcoming count matrix: ISO future counted, garbage->null, past excluded) + local test-row cleanup (1.2.38) | QA Engineer | 0.5 |
| 2026-07-08 | Artist data-model design session: persona/release/track/direct-single semantics, one-human-many-identities, persona-as-AI-marker + ai_assisted disclosure, art model (release cover vs per-track single art, embedded vs standalone), label + producer/writer + fingerprint schema gaps | Solutions Architect | 1.5 |
| 2026-07-08 | Client prep-app architecture design: 3-panel Library/Prep/Serve flow, local-SQLite draft vs platform serve, tag-editor writes-to-file (Mp3tag-style), DistroKid field capture, AudioRanger genre (L-061), fingerprint/guardian (L-060) staging | Solutions Architect | 1.0 |
| 2026-07-08 | Per-track cover art (cerberuslive): tracks.cover_url (mig 0024) + selfCoverUrl helper + single-render own-art + register per-track cover accept/build (1.2.39) | Lead Developer | 1.5 |
| 2026-07-08 | Embedded-art reading (CerberusAgent): extract_cover ffmpeg APIC->sidecar + cover_sidecar_name + image mime types + build_tracks wiring + 2 cargo tests (1.2.39) | Lead Developer | 1.0 |
| 2026-07-08 | Client prep-page 3-column mockup (Library/Prep/Serve, per-track fields, stage pipeline) | Lead Developer | 0.5 |
| 2026-07-08 | Cover-art verification: register cover matrix (relative->gateway/absolute/null) vs local D1, cargo tests, real embedded-APIC extraction proof, X:\Music art review (4 EP covers) | QA Engineer | 0.5 |
| 2026-07-08 | Checkpoint (cover art + client design: WBS/CHANGELOG/registry/ledger/mirror/journal/report; Ravina spelling fix) | Technical Writer / PM | 0.5 |
| **Total** | | | **288.5** |
