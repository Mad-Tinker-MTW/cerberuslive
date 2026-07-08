# Changelog — Cerberus Live Studio

## [0.15.0] — 2026-07-08

Admin control-deck overhaul: a clearer tier model, real search that scales, and a control deck
that finally reads as an admin tool instead of the public site.

### Added
- **Three-tier artist model** in the admin: Independent (self-host, on the **Free** or paid **Plus**
  plan) vs **Managed** (Cerberus-hosted). Per-tier tabs (Managed / Plus / Free) and an Artists metric
  group so paying (Plus + Managed) is separable from Free. Plus artists were previously hidden inside
  a lumped "Free Artists" count.
- **Server-side artist search + pagination** (new `api/admin/artists` route; `ADMIN_ARTIST_SELECT` /
  `ADMIN_ARTIST_SORT` / `ADMIN_ARTIST_PAGE_SIZE` in `db.ts`) so the console scales past a couple
  thousand artists. Per-tier + Fans search boxes.
- **Upcoming** admin column (future-dated accepted bookings), and **Bookings** now counts real
  booking requests only (`kind = 'booking'`, excludes message contacts).
- Admin-framed **dossier preview** (`/admin/artist/[slug]/preview`, iframe + Back-to-admin bar) and a
  **Copy public link** button (detail page + quick-view), so admins can view/share a dossier without
  leaving the deck or losing their place.
- Hover **tooltips** on every artist-control chip (Verify / Booking gate / Feature / Suspend / Delete /
  tier), each explaining the action and that the label shows the current state.

### Changed
- Control-deck header replaced with a **minimal admin header** (brand + Log out) on all admin pages;
  the public site nav, "Search artists" box, and hamburger-to-account are gone. Logout is reachable
  on every admin page.

### Fixed
- Booking-gate chip mislabelled an unset gate as red "Closed" while the dossier still accepted
  bookings (checked `=== 'open'` instead of `!== 'closed'`).

### Known
- The booking "date" field is free text, so **Upcoming** only counts ISO-shaped dates (guarded by
  `GLOB`), under-counting rather than counting garbage. A structured date field is tracked
  (`task_26dd382b`).

## [0.14.0] — 2026-07-07

Repeatable admin onboarding and the admin credential lifecycle. The site owner was a one-off
manual seed with no way to mint or promote another admin; that gap is now a product feature,
and the owner identity was reworked onto a clean account.

### Added
- Better Auth **admin plugin** (commit 33d80cd, migration 0023 adds banned/banReason/banExpires
  on user + impersonatedBy on session). New control-deck **Admins** panel on /admin/security:
  **Create new** mints a standalone admin (email + username + password), **Promote existing**
  turns a fan/artist into an admin (role + password + username in one action). Lists active admins,
  each with a **Retire** action (admin.removeUser, cascades login/password/TOTP; guarded against
  removing yourself or the last admin) to complete the admin onboarding/offboarding lifecycle.
- Self-service **Change password** card on /admin/security (commit 1ebb670): current -> new,
  revokes other sessions. Replaces the promote-existing workaround for rotating your own password.
- Account-recovery **Change email** control on /admin/artist/[slug] (commit c8d4fee): changes an
  artist's login email in place via admin.updateUser. In-place keeps user.id, so the artist's
  profile, tracks, and connected Agent (authenticated by the agent_key on the profile, not the
  email) survive untouched. For when an artist loses inbox access and can't receive the magic link.

### Changed
- Admin identity reworked: the control-deck owner is now Francisco De La Paz
  (francisco.delapaz.jr@outlook.com, @francisco.delapaz), promoted via the new plugin path, TOTP
  enrolled, added to the Cloudflare Access allow-list, and verified end to end on a fresh re-login
  (Access -> password -> TOTP). The legacy mad.tinker admin remains until formally retired.

## [0.13.0] — 2026-07-07

The public discography went from a flat waveform list to the pinned art-driven mockup, with a
proper single-source player and real cover art.

### Added
- Discography render rebuilt to the mockup (commit b05ee60, deployed): featured-release hero,
  filter chips (All/Albums/EPs/Singles/Personas/Collaborations), search + sort, an art-driven
  release-card grid, a release detail side panel with numbered tracklist, and a sticky
  now-playing bar. Render-only; the SSR-safe flattening lives in discographyModel.ts.
- Real EP cover art on the owner's dossier: the four covers were sitting in an "Album Covers"
  folder the Agent never matched; wired cover_url to the tunnel-served gateway paths (free-tier,
  no R2), verified 200. A durable auto-match (Agent scans Album Covers + per-release folders,
  serves images with correct Content-Type; register stores cover_url; render onError->placeholder)
  is built on branches agent-cover-match (359310c) + register-cover (612e19b), pending merge/deploy.

### Changed
- Single-source discography player (commit fd0e8f5, deployed): one <audio> element via a
  PlayerProvider; the featured song, Play Album, and every track button route through it, so two
  sources can no longer play at once. Waveforms retired in the discography; the now-playing bar is
  the compact mockup player (thumb, title, prev/play/next, thin scrubber, volume, queue).

### Fixed
- Featured-song + Play-Album overlap (two audio elements playing simultaneously) resolved by the
  single-source controller.

## [0.12.0] — 2026-07-07

The no-paste artist on-ramp went from "planned wrong, can't ship" to working end to end.

### Added
- (Deployed) Device-authorization onboarding (RFC 8628): `/device` page + `/api/auth/device`,
  `/token`, `/approve`, `/deny`, plus `/api/agent/installer`. Built earlier but never pushed;
  deployed this session. The Cerberus Agent now links to an account with no key/token paste.
- Cerberus-line flow plan (Q:\MTW\Docs\CERBERUS-LINE-FLOW.md): two frozen invariants (window
  not service; client ships/tests without the PC or WSL, no-paste wizard), the pipeline, three
  frozen contracts, and the slice order.
- Discography design contract pinned (web/docs/designs/discography.png): art-driven release
  cards, featured hero, filters, detail panel, now-playing bar. The target for the discography
  rebuild + the client-side add-art / preview-before-publish editor.

### Fixed
- CORS on the device-auth routes: `/api/auth/device` + `/token` sent no `Access-Control-Allow-Origin`,
  so the Agent's Tauri-webview `fetch()` was silently blocked ("Failed to fetch"). Added permissive
  CORS + an OPTIONS handler to both (device endpoints are public; the security is the user code +
  approval). Verified live.

### Infrastructure
- Prod D1: audited after the artist/media wipe (admin intact; artist_profiles/tracks empty; R2
  buckets gone). Reinstated then deleted f-de-la-paz to allow a genuine fresh signup. Verified the
  real signup created `mad-tinker` (free tier, self-host tunnel, 21 tracks, full persona/release
  discography scanned by the Agent).
- Two CI prod deploys (device-auth routes, then the CORS fix).

## [0.11.0] — 2026-06-30

Live Phase B (social + performance) plus the self-managed+ billing path. Four builds, all
deployed to prod (migrations 0020-0021) and verified.

### Added
- **Profile feed** (migration 0020 `posts`): artists post updates to their dossier, **public** or
  **followers-only**. A Feed tab appears when there are posts; followers-only posts are gated
  server-side (never sent to a non-follower, not even in the RSC payload). Create/delete from
  `/account`; `/api/posts` is ownership-scoped.
- **Performance modes**: live audio auto-profiles from the artist's roles — **Stage** (music: stereo
  Opus, voice DSP off so music isn't pumped/ducked) vs **Mic** (spoken: mono, light noise
  suppression). Adds an audio-input-device picker (capture your mixer, not a room mic) and a
  480p/720p toggle. Opus stereo/bitrate tuning + an audio bitrate cap in the publish path.
- **Remaining-minutes UX**: `/account` shows your weekly live budget (used/remaining, viewer +
  session caps) with a bar; managed shows "unmetered".
- **Self-managed+ billing** (migration 0021): upgrade to the $29.99/mo tier via Stripe Checkout;
  manage/cancel via the Billing Portal; a signature-verified webhook flips tier `free`<->`plus` on
  the subscription lifecycle (managed/admin never touched). A thin fetch-based Stripe client (no
  SDK) keeps the Worker bundle lean. The `BillingCard` shows upgrade / manage / managed states.

### Infrastructure
- Migrations 0020 (`posts`) + 0021 (`stripe_*` columns on `artist_profiles`) applied to prod D1;
  deployed via CI.
- **Operator to activate billing**: set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PLUS`,
  `STRIPE_WEBHOOK_SECRET` on the web worker and register the webhook endpoint
  (`/api/billing/webhook`) for `checkout.session.completed` + `customer.subscription.updated/deleted`.
  Until then the billing routes gate to 503 and the upgrade button shows "not enabled yet".

## [0.10.1] — 2026-06-30

Live Phase A.6: the free WebRTC window now enforces its per-tier concurrent-viewer cap.

### Added
- **Concurrent-viewer cap** (migration 0019 `live_viewers`): each viewer claims a slot at
  `/api/live/viewer` (join), heartbeats it every ~10s, and releases it on unmount; a stale row (a
  missed beat or a closed tab) is purged on write so the slot frees. Joins past the tier's
  `viewer_cap` are refused and the watch page shows a "full" state instead of connecting. Admins
  and the artist themselves bypass the cap and never occupy a counted slot. D1-backed (no Durable
  Object), the same MVP pattern as live reactions.

### Infrastructure
- Migration 0019 (`live_viewers`) applied to local + prod D1; deployed via CI (commit e92abd2).

## [0.10.0] — 2026-06-30

Live Phase A: the free WebRTC window goes from "it streams" to a usable live experience, plus
moderation and the deferred-follow conversion. Built, verified, and deployed to prod.

### Added
- **Viewer states + Report**: the watch page shows connecting / stream-ended states (no more
  broken-icon flash or frozen frame) and a one-tap Report that lands in the control-deck inbox.
- **Admin live moderation**: a control-deck "Live now" panel lists active streams with Watch +
  force-end (kill), reachable only on the control-deck host.
- **Tier caps + weekly-minute budget**: `LIVE_TIERS` (free = 10 min/wk, 25 viewers, 0.7 Mbps;
  managed generous) enforced at go-live via a rolling 7-day budget, with a per-tier bitrate cap.
  The paid self-managed+ tier (90 min/wk, 50, 1 Mbps) is config-wired pending billing.
- **Deferred-follow** (migration 0017): an anonymous viewer leaves an email mid-show and keeps
  watching; a confirm link makes them an email-only follower (feeds managed blasts). Unconfirmed
  intents purge after 7 days.
- **Anonymous live reactions** (migration 0018): tap an emoji, it floats for everyone via a light
  D1 + short-poll (no Durable Object), purged after ~2 minutes.

### Infrastructure
- Migrations 0017 (`follow_intents`) + 0018 (`live_reactions`) applied to prod D1; deployed via CI.

## [0.9.0] — 2026-06-29

Artist types and media model (L-048): the catalog gains structure (personas, releases,
discography, dedications), video and live lanes land, and the gateway splits free from paid.
Built + verified locally; prod deploy (migrations 0013-0016, push, secrets) is operator-gated.

### Added
- **Discography model** (migration 0013): Artist -> personas (solo/group) -> releases
  (album/EP/single) -> tracks, plus a direct/self lane and persona singles. A **dedication /
  story** field on personas and releases (the differentiator). Type-aware Discography tab on the
  dossier; group EPs show per-member version credits.
- **Discography editor**: `/account/discography` full CRUD (personas/releases/tracks) via the
  ownership-checked `/api/discography`; deletes reassign child tracks to the direct lane rather
  than destroying them. Plus **roles** chips in the profile editor.
- **Video lane** (migration 0014 `media_kind`): video tracks stream through the gateway and
  render in the Live Sets tab + inline in the discography.
- **Installable PWA**: web manifest (standalone), maskable icon, service worker (offline
  fallback, never caches media/API).
- **Live lane** (migration 0016 `live_sessions`): go-live / end-live with caps, a LIVE badge on
  the dossier, and a `/live/[slug]` watch page. Free WebRTC "window" (Cloudflare Realtime via a
  token-hiding `/api/live/rtc` proxy) + managed Stream Live "event" (live-input creation + HLS
  iframe embed).

### Changed
- **Agent rework** (CerberusAgent, migration 0015 `managed_by`): the self-host agent now scans
  recursively (folder = persona, subfolder = release), auto-imports embedded tags via ffprobe
  (Album Artist / Album / Track / Composer / Title), handles video, and re-syncs on a file
  watcher. `/api/agent/register` reconciles instead of blunt-wiping: it replaces only the agent's
  own tracks and find-or-creates personas/releases by name, so web-curated tracks and
  artist-edited dedications survive a re-sync.
- **Media gateway is tier-aware**: free / self-host = pure tunnel pass-through (nothing stored in
  R2, online only when the artist's PC is on); managed = R2 read-through cache. Stops the gateway
  from durably caching free artists, which was giving away the paid product.

### Infrastructure
- Migrations 0013-0016 applied to LOCAL D1 only. Prod is gated: apply 0013-0016 to prod D1,
  deploy the media worker, push web (CI), and for live set `CF_REALTIME_APP_ID`/`CF_REALTIME_APP_TOKEN`
  + CF Stream creds, then verify the media + live paths.

### Notes
- The live WebRTC camera/viewer media path is implemented against the Cloudflare Calls REST flow
  but is NOT yet verified end-to-end (needs the secrets above + two real devices). The live
  presence / watch / caps surface and the Stream HLS embed are verified.

## [0.8.1] — 2026-06-29

Secure control deck shipped to prod. Admin now lives on its own host behind three layers,
and is gone from the public site entirely.

### Added
- **In-app TOTP 2FA** (better-auth `two-factor`, migration 0012): authenticator enrollment at
  `/admin/security`, and a TOTP challenge on owner sign-in.
- **`controldeck.cerberuslive.studio`** custom domain (attached to `cerberuslive-web` via the
  Cloudflare API) front-ending the admin, with **Cloudflare Access** (email one-time PIN,
  owner-only) gating it at the edge.

### Changed
- **Final lockdown**: the public `/login` is now magic-link only (owner toggle removed), and
  `/admin`, `/admin/artist/[slug]`, `/admin/fan/[id]`, `/admin/security` are host-gated to the
  control-deck host (they 404 on the apex). Admin is reachable only at
  `controldeck.cerberuslive.studio` behind Access + owner password + authenticator TOTP.

### Infrastructure
- Prod D1 migrations `0011_support_messages` + `0012_two_factor` applied.
- Custom domain added via Cloudflare API (the dashboard wizard mis-handled the subdomain);
  OpenNext was not the blocker.

## [0.8.0] — 2026-06-29

Admin control-deck overhaul. On the `controldeck` branch (not deployed): the owner-login
relocation and migration 0011 wait for the controldeck subdomain + Cloudflare Access + prod
D1 migration. Plan: docs/ADMIN-CONTROLDECK-PLAN.md.

### Added
- **Control deck**: the admin page is rebuilt as a tabbed console (Overview / Managed / Roster /
  Fans / Venues / Inbox) with a metric bar that excludes the owner, sortable per-entity tables,
  expandable controls, and tier promote/demote.
- **Entity detail pages**: `/admin/artist/[slug]` (tracks, bookings, reviews + moderation,
  controls, contact) and `/admin/fan/[id]` (follows, reviews, bookings, role, contact).
- **Support inbox**: a public `/contact` form (`/api/support`) writes to the new
  `support_messages` table; the Inbox tab is a queue with resolve and reply (email via Resend).
  Plus contact-a-user from any detail page.
- **Booking activity metrics**: all-time bookings, distinct artists booked, and last-30-days, so
  platform booking success is visible at a glance. The owner is BCC'd on non-managed bookings.
- **Controldeck auth scaffold**: host-gating (`lib/host.ts`) and a relocated owner login at
  `/admin/login`; the public `/login` is unchanged for now.

### Changed
- **Status fields consolidated**: the dossier's three verification fields (`signal_status`,
  `clearance`, and the jargon "Gate Status") collapse to a single "Verification" row driven by
  `verified`; "Gate Status" is relabeled "Booking". `signal_status`/`clearance` are retired as
  separate state (columns kept, no longer read).
- Header "Contact" link now points to the real `/contact` form.

### Infrastructure
- Migration `0011_support_messages.sql` (applied to local D1; prod is an operator step).

## [0.7.2] — 2026-06-29

Dossier enrichment (L-046): the artist page gains a visual, quick-scan layer aimed at a booker's
ten-second read, plus self-serve editor controls for it.

### Added
- **Artist DNA radar**: a pure-SVG six-axis stat chart (Stage Energy, Technical Skill, Crowd
  Interaction, Originality, Versatility, Improvisation), 0-100 per axis, server-rendered and themed.
  Axis labels live inside the viewBox so they scale with the chart and never clip.
- **Artist Traits** (1-5 star ratings), **Signature Sounds** (checklist), and **Influences** (tag
  chips) sections on the Overview tab, after Sound & Style.
- Editor controls for all four: DNA sliders, per-trait star raters, and toggle-chip pickers, with
  `/api/profile/update` whitelisting and clamping (ratings 1-5, DNA 0-100, blanks dropped).

### Notes
- All four fields live in the existing `profile_json` blob, so no migration was required.
- Each card hides when its data is empty, preserving graceful degradation for sparse profiles.

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
