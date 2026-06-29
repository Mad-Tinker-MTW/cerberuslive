# Changelog — Cerberus Live Studio

## [0.5.1] — 2026-06-28

Discovery, self-serve dossier completeness, and trust-model enforcement.

### Added
- **Discovery**: search (name/city/genre) + genre-chip browse with live count on the home.
- **Profile editor** gains performance-profile (crowd fit, clean set, languages, energy, equipment, stage-presence) + a 7-day availability toggle; the dossier perf card falls back to Quick-Info scalars.
- **Negative-review escalation**: a 3rd approved negative review auto-closes the booking gate; admin sees a warning badge at 2+. Closed-gate artists no longer accept bookings (server-enforced; dossier shows "not accepting bookings"; messages still allowed).
- **Play-count tracking**: migration 0007 + `POST /api/tracks/play`; counts shown on the Media tab.

## [0.5.0] — 2026-06-28

Media, bookings, follows, and the reviews/verification trust model.

### Added
- **First-party media playback**: AudioPlayer (Range streaming through the artist's self-host tunnel, graceful offline state), Media tab, featured-track playback. `POST /api/agent/register` publishes the tunnel URL + track list. Migration 0004 (tunnel_url, agent_key, contact_email, `tracks`, `bookings`).
- **Bookings backend**: in-platform Book/Message/Request replaces the mailto stubs. Routes notifications to the artist's email, or the admin desk for managed artists. Correct subjects, reply-to the requester.
- **Follow / fan system**: Follow button + count on dossiers, `/following` page. Migration 0005.
- **Agent-key UI**: "Self-host agent" panel in /account (generate key, config snippet, tunnel status).
- **Reviews + admin moderation + earned verification**: reviews submit as pending; `/admin` (role-gated) approves/rejects, sets verify/gate, shows tunnel status + bookings. Verified/signal/gate stay admin-only. Migration 0006.

### Changed
- Media is first-party only (off-platform Spotify/YouTube/SoundCloud buttons removed); social links reframed as "Follow".

### Companion
- New **Cerberus Agent** desktop app (Tauri v2) + Bun CLI engine at `Q:\MTW\CerberusAgent` — the artist self-host media tool.

## [0.4.0] — 2026-06-28

Authentication: Better Auth, passwordless magic-link (L-029).

### Added
- **Better Auth** integrated on the `cerberuslive-web` Worker, passwordless magic-link via Resend. D1 is passed straight to the adapter (Better Auth auto-detects D1 and builds its own `D1SqliteDialect`; no kysely-d1 needed). The instance is built per-request from the Cloudflare context (`getAuth(env)` / `authFromContext()`).
- Migration `web/db/0003_better_auth.sql`: Better Auth core tables (`user`, `session`, `account`, `verification`) in sqlite mode (ISO-string dates, integer booleans), with a `role` column on user (artist / fan / venue / admin, default fan).
- `/login` (passwordless email → magic link), `/account` (session view, sign out, self-serve artist-dossier claim), `POST /api/auth/[...all]` handler, `POST /api/profile/create` (creates `artist_profiles` linked to `user_id`, promotes role to artist), `lib/auth-client.ts`.
- Header account icon links to `/account` (gates to `/login`).

### Verified
- Full flow exercised locally against D1: magic-link send (link logged in dev) → verify → session (`role=fan`, `emailVerified=true`) → profile claim (slug minted, role → artist) → dossier renders and appears in discovery. Test data cleaned from local D1.

### Notes
- Secrets `RESEND_KEY` + `BETTER_AUTH_SECRET` are set on the web worker and in local `web/.dev.vars` (gitignored). Migration 0003 still needs applying to the remote prod D1 at deploy.

## [0.3.1] — 2026-06-28

Branded home + housekeeping (L-030 brand port, L-031 typo).

### Added
- Real Cerberus landing ported to the Next home route (`web/src/app/page.tsx`): logo hero, "guarding the gates" tagline, three pillars (Profile/Media/Booking), and the artist discovery grid, sharing the dossier site header and tuned theme. Logo copied to `web/public/logo.png`.

### Fixed
- `features.config.ts` Phase 3 flag typo `territoryClaimsn` renamed to `territoryClaims` (no other references; BUGS entry closed).

### Decided
- Auth provider locked in: **Better Auth** (over Clerk / NextAuth), self-hosted in the OpenNext Worker, links to `artist_profiles.user_id`, magic-link via Resend. Reconciled the stale "Clerk or NextAuth (TBD)" wording across SPEC, ULTRAPLAN, WBS 1.2.2, and the Schedule; BUGS "auth provider not chosen" closed.

### Notes
- The waitlist signup form stays on the dedicated waitlist worker; bringing it onto the platform home would need a Next `/api/waitlist` route plus the `TURNSTILE_SECRET` bound on the web worker (deferred, deploy-time).

## [0.3.0] — 2026-06-28

Artist dossier page v1 (L-028): the rich talent-dossier replaces the minimal artist page.

### Added
- Rich SSR `/artist/[slug]` dossier per `docs/artist-dossier-brief.md`: site header, artist sidebar (portrait with earned Verified badge, Book/Message, Quick Info, social row, Dossier ID card with barcode), dossier hero with the Cerberus Dossier table (Class, Signal, Gate Status, Booking Range, Clearance, Member Since), featured track card, tabbed profile (Overview live; Media/Live Sets/Press Kit/Reviews UI-only), Overview cards (About, Sound & Style, Best For tiles, Performance Profile, Media Highlights), and a Booking section (availability strip + request)
- D1 migration `web/db/0002_artist_dossier.sql`: nullable dossier columns + `profile_json` blob; seeds STCO (CLS-STCO-001) and partially enriches nyx-prowl
- `getArtistDossier`, dossier types, and a safe `parseJson` helper in `web/src/lib/db.ts`
- 12 dossier components under `web/src/components/dossier/`

### Changed
- Theme tuned toward the dossier brief palette (darker base `#050505`, brighter red `#d71920`, new panel/panel-soft/red-soft/green tokens)
- The page is fully data-driven and degrades gracefully: a missing field hides its card, row, or badge (designed for a 30%-complete profile, verified across full/partial/sparse seed artists)

## [0.2.0] — 2026-06-28

Phase 1 platform shell and public artist profile pages.

### Added
- Next.js 15.5 platform in `web/`, deployed to Cloudflare Workers via the OpenNext adapter (preview: cerberuslive-web.frankydlp.workers.dev)
- D1 `artist_profiles` table plus 3 seeded artists
- Home discovery page; public `/artist/[slug]` SSR pages with SEO metadata, dark Cerberus theme, and 404 handling
- GitHub Actions CI: a push to main builds on Linux and deploys, sidestepping OpenNext's Windows incompatibility
- Full MTW PMP doc suite (CLS-PMD-001 through 006) plus SPEC/VISION/ROADMAP/BUGS and the Obsidian mirror, via /doc-project

### Fixed
- Next 16 plus OpenNext "version trap" (standalone build fails): pinned to Next 15.5
- OpenNext cannot build on native Windows: moved build and deploy to GitHub Actions on Linux

## [0.1.0] — 2026-06-28

First IaC relaunch of the Phase 0 waitlist, homed in its own repo.

### Added
- Project homed at `Q:\MTW\cerberuslive` (consolidated from `cerberus-waitlist`)
- One-worker architecture (`src/index.js`): serves the static landing page via the ASSETS binding and handles `POST /api/waitlist`
- `wrangler.jsonc` Infrastructure-as-Code config (D1 + Assets bindings)
- `README.md`, `.gitignore`, `docs/ULTRAPLAN.md` (platform master plan), `features.config.ts`
- Registered in the TinkerOps registry (status: active)

### Fixed
- Turnstile incident on the live waitlist: a two-character sitekey transposition (`dS` instead of `Ds`) plus an unset `TURNSTILE_SECRET`, which made every signup return 403 "Bot verification failed"

### Infrastructure
- Cloudflare account audited, backed up, and wiped to a clean slate (backup at `Q:\MTW\CloudflareBackup\2026-06-28`)
- D1 `cerberus-waitlist` recreated and schema applied; new Turnstile widget secret wired to the worker
- Worker deployed, `cerberuslive.studio` custom domain attached
- End-to-end signup verified live: widget challenge to token to siteverify to D1 row
