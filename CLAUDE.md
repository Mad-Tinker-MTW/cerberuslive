# Cerberus Live Studio — Claude Code Context

## What This Is
A creator platform for underground artists, DJs, and performers: artist profile dossiers,
a self-hosted media vault (via Cloudflare Tunnel), and a booking layer. Phase 0 waitlist is
live at cerberuslive.studio; the full 6-phase platform is in build. Tagline: "Guarding the
gates of the underground."

## Repo Shape (three workers, one D1)
- `src/index.js` + `public/` — the Phase 0 **waitlist worker** (cerberus-waitlist). Serves the
  static landing via the ASSETS binding and handles `POST /api/waitlist`. Still live on cerberuslive.studio.
- `web/` — the **Next.js 15.5 platform** (cerberuslive-web), built to Cloudflare Workers via the
  OpenNext adapter. On the preview URL (cerberuslive-web.frankydlp.workers.dev), running against PROD D1.
- `media/` — the **media gateway worker** (cerberus-media), a plain Worker on the
  `media.cerberuslive.studio` custom domain. Resolves each artist's hidden tunnel origin from D1 and
  serves media through an R2 read-through cache. Unlike the OpenNext web worker, it builds + deploys
  on Windows via `wrangler deploy`. See the Media Gateway section + docs/MEDIA-GATEWAY-PLAN.md.
- All three bind the **same D1** `cerberus-waitlist` (binding name `DB`): tables `waitlist`,
  `artist_profiles`, `tracks`, `bookings`, `follows`, `reviews`, and the Better Auth tables
  (`user`/`session`/`account`/`verification`).

## Media Gateway (how media streams)
Public media is `GET media.cerberuslive.studio/<slug>/<file>`, served by the `media/` worker. Each
artist runs the Cerberus agent (Q:\MTW\CerberusAgent), which serves their local music folder and runs
a **named** cloudflared tunnel terminating at the hidden two-level host `t-<slug>.cerberuslive.studio`
(two-level so the `*.cerberuslive.studio` Universal SSL wildcard covers it; a three-level host had no
edge cert). The gateway looks up `artist_profiles.media_origin`, serves from R2 if cached, else fetches
from the origin and tees into R2 (so hot tracks survive an offline artist). Provisioning is self-serve:
`/account` "Set up streaming" -> `/api/agent/provision` -> `lib/cf-tunnel.ts` creates the tunnel +
ingress + proxied CNAME via the CF API and hands the agent a run token. The hidden origin host is
NEVER sent to the client (the dossier scrubs `media_origin`/`tunnel_url`; `MediaCtx` carries only the
slug + a `hasMedia` boolean).

## Stack
- Next.js 15.5 (App Router, NOT 16 — version trap), React 19, TypeScript, Tailwind v4
- Cloudflare Workers + D1 + R2 (cerberus-media cache, cerberus-images photos) + Turnstile,
  OpenNext adapter, Resend (email)
- Better Auth: passwordless magic-link for everyone, plus email+password + the username plugin so
  the site owner (`mad.tinker`) signs in by username + password
- Package manager: bun (never npm/npx; use bunx)

## Launch / Dev
```
cd web && bun run dev        # Next platform (next dev); D1/R2 bindings via initOpenNextCloudflareForDev + .dev.vars
bunx wrangler dev            # root waitlist worker
cd media && bun run dev      # media gateway worker
```
Local D1 migrations: `cd web && bunx wrangler d1 execute cerberus-waitlist --local --file=db/000X_*.sql`
NOTE: `wrangler dev` / workerd does NOT run on this Windows box (even hello-world hangs, connections
sit in CLOSE_WAIT). `next dev` works. So plain-Worker binding paths verify at deploy; pure logic is
covered by `bun test` (see media/test). The media worker has 8 unit tests for its Range/header logic.

## Auth (Better Auth)
- Built per-request from the Cloudflare context (`web/src/lib/auth.ts` `getAuth(env)` /
  `authFromContext()`), because the D1 binding and secrets only exist per-request.
- D1 is passed straight to `database` — Better Auth auto-detects D1 and builds its own
  `D1SqliteDialect` (no kysely-d1). Magic-link email via Resend.
- `emailAndPassword` is enabled + the `username` plugin: `/login` has a magic-link form and an
  "Owner / admin sign-in" toggle (username + password). The owner `mad.tinker` is a seeded admin.
- The `role` column on user is fan/artist/venue/admin (default fan). Admins manage roles at `/admin`
  (last-admin lock-out guard). Claiming a dossier promotes fan->artist but never downgrades admin/venue.
- Routes: `/login`, `/account` (+ `/account/edit`), `/admin` (role-gated), `/api/auth/[...all]`,
  `/api/profile/create` + `/api/profile/update` + `/api/profile/photo`, `/api/agent/key` +
  `/api/agent/register` + `/api/agent/provision`, `/api/admin/{review,artist,user}`,
  `/api/media/photo/[slug]`, `/api/bookings`, `/api/reviews`, `/api/follow`, `/api/tracks/play`.

## Migrations
`web/db/` numbered SQL, `0001`–`0010`: artist_profiles, artist_dossier, better_auth, media_and_bookings,
follows, reviews, play_count, media_gateway (media_origin/tunnel_id/tunnel_token), username_owner
(username/displayUsername), artist_admin_flags (suspended/featured). Applied to BOTH local and PROD D1.
`db/cleanup-all.sql` wipes content + auth for a virgin run (keeps waitlist + schema).

## Secrets
- Root waitlist worker: `TURNSTILE_SECRET`.
- Web worker: `RESEND_KEY`, `BETTER_AUTH_SECRET`, and CF provisioning `CF_API_TOKEN`
  (Cloudflare Tunnel Write + zone DNS Write), `CF_ACCOUNT_ID`, `CF_ZONE_ID`. (`.dev.vars` for dev.)
- Resend key file on disk: `C:\Users\MadTi\.cerberus-resend-key`. Never commit secrets.

## Deploy
- Web worker: OpenNext cannot build on native Windows; **CI (GitHub Actions) builds on Linux and
  deploys** on push to main. Do not attempt `opennextjs-cloudflare build` locally on Windows.
- Media worker: plain Worker, `cd media && bunx wrangler deploy` (builds on Windows fine).
- Prod D1 migrations are a manual step: `bunx wrangler d1 execute cerberus-waitlist --remote --file=...`.

## Key Rules
- bun/bunx only, never npm/npx/pnpm.
- Next.js stays on 15.5 (16 + OpenNext is a known standalone-build trap).
- Feature gates live in `features.config.ts` (flip per phase).
- Data-driven pages must degrade gracefully (design for a 30%-complete profile).
- Keep SSR + SEO on public pages (the reason the platform runs Next, not a SPA).
- `web/AGENTS.md` warns this Next version has breaking changes; follow existing code patterns.

## Status
Phase 1 + the media layer are OPERATIONAL on prod (2026-06-29): owner/admin password login, artist
signup + dossiers, photo upload, media streaming (gateway + R2 cache, verified 206 end-to-end),
bookings, reviews, and a built-out admin console (users + role control, stats, waitlist + CSV,
artist suspend/feature/delete). Running against PROD D1 on the preview URL. The main thread left is
the **public-domain cutover** — cerberuslive.studio still serves the Phase 0 waitlist (operator
decision; decide the waitlist story, then DNS-flip). 122.0h logged. Authoritative hours log + task
status live in the WBS (docs/PMP/CLS-PMD-003-WBS.md); cross-workshop threads in Q:\MTW\Docs\OPEN-LOOPS.md
(L-030/L-044/L-045).
