# Changelog — Cerberus Live Studio

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
