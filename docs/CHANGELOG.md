# Changelog — Cerberus Live Studio

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
