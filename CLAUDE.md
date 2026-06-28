# Cerberus Live Studio — Claude Code Context

## What This Is
A creator platform for underground artists, DJs, and performers: artist profile dossiers,
a self-hosted media vault (via Cloudflare Tunnel), and a booking layer. Phase 0 waitlist is
live at cerberuslive.studio; the full 6-phase platform is in build. Tagline: "Guarding the
gates of the underground."

## Repo Shape (two workers, one D1)
- `src/index.js` + `public/` — the Phase 0 **waitlist worker** (cerberus-waitlist). Serves the
  static landing via the ASSETS binding and handles `POST /api/waitlist`. Live on cerberuslive.studio.
- `web/` — the **Next.js 15.5 platform** (cerberuslive-web), built to Cloudflare Workers via the
  OpenNext adapter. Currently on the preview URL (cerberuslive-web.frankydlp.workers.dev).
- Both bind the **same D1** `cerberus-waitlist` (binding name `DB`): tables `waitlist`,
  `artist_profiles`, and the Better Auth tables (`user`/`session`/`account`/`verification`).

## Stack
- Next.js 15.5 (App Router, NOT 16 — version trap), React 19, TypeScript, Tailwind v4
- Cloudflare Workers + D1 + R2 + Turnstile, OpenNext adapter, Resend (email)
- Better Auth (passwordless magic-link)
- Package manager: bun (never npm/npx; use bunx)

## Launch / Dev
```
cd web && bun run dev        # Next platform; D1 bindings via initOpenNextCloudflareForDev + .dev.vars
bunx wrangler dev            # root waitlist worker
```
Local D1 migrations: `cd web && bunx wrangler d1 execute cerberus-waitlist --local --file=db/000X_*.sql`

## Auth (Better Auth)
- Built per-request from the Cloudflare context (`web/src/lib/auth.ts` `getAuth(env)` /
  `authFromContext()`), because the D1 binding and secrets only exist per-request.
- D1 is passed straight to `database` — Better Auth auto-detects D1 and builds its own
  `D1SqliteDialect` (no kysely-d1). Magic-link email via Resend.
- Routes: `/login`, `/account` (session + self-serve dossier claim), `/api/auth/[...all]`,
  `/api/profile/create`. The `role` column on user is artist/fan/venue/admin (default fan).

## Migrations
`web/db/` numbered SQL: `0001_artist_profiles`, `0002_artist_dossier`, `0003_better_auth`.
Applied to LOCAL D1. Remote prod D1 application is a deploy step (not yet done).

## Secrets
- Root waitlist worker: `TURNSTILE_SECRET`.
- Web worker: `RESEND_KEY` + `BETTER_AUTH_SECRET` (also in gitignored `web/.dev.vars` for dev).
- Resend key file on disk: `C:\Users\MadTi\.cerberus-resend-key`. Never commit secrets.

## Deploy
OpenNext cannot build on native Windows; **CI (GitHub Actions) builds on Linux and deploys**
on push to main. Do not attempt `opennextjs-cloudflare build` locally on Windows.

## Key Rules
- bun/bunx only, never npm/npx/pnpm.
- Next.js stays on 15.5 (16 + OpenNext is a known standalone-build trap).
- Feature gates live in `features.config.ts` (flip per phase).
- Data-driven pages must degrade gracefully (design for a 30%-complete profile).
- Keep SSR + SEO on public pages (the reason the platform runs Next, not a SPA).
- `web/AGENTS.md` warns this Next version has breaking changes; follow existing code patterns.

## Status
Phase 1 in build: artist dossier page, branded home, and Better Auth all built and verified
locally (2026-06-28). Not yet live in prod (preview only). See docs/STATUS.md and the WBS
(docs/PMP/CLS-PMD-003-WBS.md). Authoritative hours log lives in the WBS.
