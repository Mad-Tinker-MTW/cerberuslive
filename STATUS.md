# Cerberus Live Studio — Status

## Current State
Phase 1 (MVP Platform) in build. Phase 0 waitlist is live at cerberuslive.studio. The platform
(web/) runs on the preview worker (cerberuslive-web.frankydlp.workers.dev); the artist dossier
page, branded home, and Better Auth are built and verified locally but NOT yet cut over to prod.

## Last Updated
2026-06-28

## What Works
- Phase 0 waitlist: live signup by role, Turnstile-protected, lands in D1 (cerberuslive.studio)
- Platform scaffold: Next.js 15.5 + OpenNext to Workers, GitHub Actions CI (builds on Linux)
- Rich artist dossier page (SSR /artist/[slug]): sidebar, dossier hero, featured track, tabs,
  overview, booking; data-driven with graceful degradation (verified full/partial/sparse)
- Branded home: logo hero, tagline, three pillars, artist discovery grid
- Better Auth: passwordless magic-link via Resend, /login + /account, self-serve dossier claim,
  role on user (artist/fan/venue/admin). Full flow verified locally against D1.
- D1 migrations 0001 (artist_profiles), 0002 (dossier), 0003 (better_auth) applied to local D1
- tsc, next build, and lint all clean

## What Needs Work
- DEPLOY GATE: apply migrations 0002 + 0003 to the remote prod D1, deploy via CI, cut
  cerberuslive.studio over from the waitlist worker to the platform, clear the prod test row
  (mad.tinker@outlook.com)
- Auth follow-ups (non-blocking): full role management (venue/admin), profile-edit UI,
  optional waitlist form on the platform home
- Phases 2-6 (media vault, live room, booking, managed, monetization) per ROADMAP

## Next Session
The deploy gate: prod migrations + deploy + domain cutover. Everything blocking it is a
production/secrets action for the operator. A formal deploy runbook can be prepared on request.
