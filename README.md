# Cerberus Live Studio

Creator platform for underground artists, DJs, and performers: profile, self-hosted media vault, and booking layer. Built by Mad Tinker's Workshop (MTW) under 4Kings Enterprises.

- **Live:** https://cerberuslive.studio (Phase 0, waitlist)
- **Status:** Waitlist live; full 6-phase platform in build. See `docs/ULTRAPLAN.md`.

## Stack
- Cloudflare Workers (static assets + API), D1, R2, Turnstile
- Platform (planned): Next.js App Router via the OpenNext adapter, deployed to Workers
- Package manager: **bun** (never npm or npx, use `bunx`)

## Layout
- `public/` — landing page, served as static assets
- `src/index.js` — Worker: serves the page and handles `POST /api/waitlist`
- `schema.sql` — D1 `waitlist` table
- `features.config.ts` — phased feature flags
- `wrangler.jsonc` — Cloudflare config (D1 + assets bindings)
- `docs/` — ULTRAPLAN (master plan) plus legacy reference files

## Develop
```
bun install
bunx wrangler dev        # local
bunx wrangler deploy     # ship
```

## Required secret
`TURNSTILE_SECRET` must be set on the Worker (`bunx wrangler secret put TURNSTILE_SECRET`), or every signup returns 403 "Bot verification failed".
