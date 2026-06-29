# Cerberus Live Studio

Creator platform for underground artists, DJs, and performers: artist dossiers, a self-hosted media
vault, and a booking layer. Built by Mad Tinker's Workshop (MTW) under 4Kings Enterprises.

- **Live:** https://cerberuslive.studio (the platform)
- **Status:** Phase 1 operational on prod; see `STATUS.md` and `docs/PMP/CLS-PMD-003-WBS.md`.

## Repo shape (two workers, one D1)
- `web/`: the **Next.js 15.5 platform** (`cerberuslive-web`), built to Cloudflare Workers via the
  OpenNext adapter. Serves `cerberuslive.studio`. Deployed by CI (GitHub Actions, builds on Linux).
- `media/`: the **media gateway worker** (`cerberus-media`) on `media.cerberuslive.studio`: resolves
  each artist's hidden tunnel origin and streams through an R2 read-through cache. Deploys with
  `wrangler deploy` (builds on Windows).
- Both bind the same D1 `cerberus-waitlist` (binding `DB`): `waitlist`, `artist_profiles`, `tracks`,
  `bookings`, `follows`, `reviews`, and the Better Auth tables.

The Phase 0 waitlist worker was retired at go-live 2026-06-29 (`cerberuslive.studio` cut over to the
platform). The `waitlist` table and its rows are preserved in D1 and surfaced in the admin console;
`schema.sql` keeps that table's DDL.

## Stack
- Next.js 15.5 (App Router, not 16), React 19, TypeScript, Tailwind v4
- Cloudflare Workers + D1 + R2 + Turnstile, OpenNext adapter, Resend (email)
- Better Auth (magic-link, plus username+password for the owner)
- Package manager: **bun** (never npm/npx; use `bunx`)

## Dev
```
cd web && bun run dev        # the platform (next dev); bindings via .dev.vars
cd media && bun run dev      # the media gateway worker
```
Note: `wrangler dev` / workerd does not run on the Windows dev box; plain-worker binding paths verify
at deploy, pure logic via `bun test` (see `media/test`).

## Docs
`docs/` (SPEC, VISION, ROADMAP, BUGS, CHANGELOG, ULTRAPLAN, MEDIA-GATEWAY-PLAN) and `docs/PMP/`
(CLS-PMD-001..006). `CLAUDE.md` holds the working context.
