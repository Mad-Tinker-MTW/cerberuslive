# Changelog — Cerberus Live Studio

## [0.7.1] — 2026-06-29

Go-live: the real domain now serves the platform, and the Phase 0 waitlist worker is retired.

### Changed
- **Domain cutover**: `cerberuslive.studio` (apex) cut over from the waitlist worker to the platform
  (`cerberuslive-web`). The platform is the live site; `media.cerberuslive.studio` already serves the
  gateway. Verified live: home, /login, owner login, dossier, and 206 media streaming at the apex.

### Removed
- **Phase 0 waitlist worker retired**: repo source removed (`src/index.js`, `public/`, root
  `wrangler.jsonc`) and the deployed worker deleted. The `waitlist` table + rows are preserved in D1
  and surfaced in /admin; `schema.sql` keeps that table's DDL.

### Fixed
- **Form-field a11y/autofill**: added `id` + `name` to every form input (login, profile editor,
  discovery search, booking, review, dossier claim) so password managers and browser autofill work
  and the DevTools "form field should have an id or name" warning clears.

### Notes
- `www.cerberuslive.studio` redirect to the apex is still pending (optional; apex is canonical).
- The Protected Audience / Shared Storage / StorageType.persistent console deprecations come from a
  browser extension (`main.js`), not the platform.

## [0.7.0] — 2026-06-29

Go-live round: the platform is operational on prod for a real-user run. Media streams end to end, the owner has a password login, and the admin console is built out.

### Added
- **Artist photo upload**: editor gets an upload/replace control; images store in R2 (`cerberus-images`, key `photos/<slug>`) and serve via `GET /api/media/photo/[slug]`. Fills the dossier photo slot that previously had no input.
- **Owner/admin password login**: Better Auth `emailAndPassword` + the `username` plugin alongside passwordless magic-link, so the site owner (`mad.tinker`) signs in by username + password while everyone else uses magic-link. `/login` gains an "Owner / admin sign-in" toggle. Migration 0009 (`username`, `displayUsername`).
- **Admin dashboard build-out**: platform stats row; **Users** panel with role control (fan/artist/venue/admin) and a last-admin lock-out guard (`/api/admin/user`); **Waitlist** viewer + CSV export; artist **suspend / feature / delete** (`/api/admin/artist`, cascades dependent rows). Migration 0010 (`suspended`, `featured`).
- **Media gateway live on prod**: `cerberus-media` worker deployed to the `media.cerberuslive.studio` custom domain; R2 buckets `cerberus-media` + `cerberus-images` created; self-serve provisioning verified end to end (named tunnel + DNS + token, 206 range streaming, R2 cache warm).

### Changed
- Discovery excludes suspended artists and pins featured ones first; the dossier 404s a suspended artist; the media gateway 403s a suspended artist.

### Fixed
- **/account/edit 500 on sparse dossiers**: `WEEK` was a non-component export from a `"use client"` module, which is `undefined` when imported by a server component, so the edit page crashed for any profile with no availability data (every freshly-claimed dossier). Moved `WEEK` to a shared non-client module.

### Infrastructure
- Prod D1 wiped to a virgin state for the real-user run (`db/cleanup-all.sql`; artists + auth cleared, waitlist + schema kept). Migrations 0008-0010 applied to prod. Owner account seeded + granted admin; owner password rotated off the bootstrap value. CF provisioning secrets (`CF_API_TOKEN`/`CF_ACCOUNT_ID`/`CF_ZONE_ID`) set on the web worker.

## [0.6.0] — 2026-06-29

The Media Gateway: media now streams through a Cerberus-controlled edge with an R2 cache, instead of pointing the browser at each artist's raw tunnel. Built but not yet deployed (operator deploy steps pending).

### Added
- **Media Gateway worker** (`media/`, `cerberus-media`): public `GET media.cerberuslive.studio/<slug>/<file>` resolves the artist's hidden tunnel origin from D1 and serves through an R2 read-through cache (Range-aware 200/206). Hot tracks survive the artist's machine being offline. Objects over 100 MB stream through uncached (long live sets); origin-offline-and-uncached degrades to a graceful 502. Migration 0008 (`media_origin`, `tunnel_id`, `tunnel_token`). 8 bun tests.
- **Self-serve streaming provisioning**: `lib/cf-tunnel.ts` creates a named Cloudflare tunnel per artist (ingress + proxied CNAME) and hands back a run token; `POST /api/agent/provision` (session-authed, idempotent) stores it; /account gains a "Set up streaming" button + token reveal. Artists never touch Cloudflare.
- **Agent named token-mode** (CerberusAgent): with a streaming token the agent runs a stable `cloudflared tunnel run --token` named tunnel instead of an ephemeral quick tunnel, and registers `{ named: true }`. Bun engine + Tauri desktop (new Streaming-token field).

### Changed
- **Media URLs route through the gateway**: `trackUrl()` now builds `media.cerberuslive.studio/<slug>/<file>`. Per-artist tunnels terminate at hidden two-level origins `t-<slug>.cerberuslive.studio` (Universal SSL covers two levels, not three, the reason the old `<slug>.media.*` host had no edge cert).
- `MediaCtx` carries only the public slug + a `hasMedia` boolean; the dossier page scrubs `media_origin`/`tunnel_url` before render so the hidden origin never reaches the client RSC payload.

### Fixed
- **RSC origin-host leak**: the hidden tunnel origin was serializing into the public dossier's client payload (via `ProfileTabs` props). Closed and verified absent in SSR output.

### Infrastructure
- Repo is now three workers on one D1 (waitlist, web, media). `docs/MEDIA-GATEWAY-PLAN.md` records the architecture and the TLS root cause (OPEN-LOOPS L-045).

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
- New **Cerberus Agent** desktop app (Tauri v2) + Bun CLI engine at `Q:\MTW\CerberusAgent`, the artist self-host media tool.

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
