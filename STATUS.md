# Cerberus Live Studio — Status

## Current State
LIVE on prod. `cerberuslive.studio` serves the platform (cut over from the Phase 0 waitlist
2026-06-29). Phase 1 (MVP Platform) plus the media layer are operational for a real-user run.
122.0h logged; see `docs/PMP/CLS-PMD-003-WBS.md` (authoritative).

## Last Updated
2026-06-29

## What Works (live on prod)
- Platform at cerberuslive.studio: branded home + discovery (search / genre)
- Auth: magic-link (Resend) for everyone + owner username+password (Better Auth username plugin)
- Artist dossiers (SSR /artist/[slug]), self-serve claim + profile editor + photo upload (R2)
- Media streaming: media.cerberuslive.studio gateway + R2 read-through cache (named per-artist
  tunnels via the Cerberus Agent); verified 206 end to end
- Bookings, follows, reviews + earned verification
- Admin console (/admin): users + role control, platform stats, waitlist viewer + CSV export,
  artist verify / gate / feature / suspend / delete
- D1 migrations 0001-0010 applied to prod; R2 buckets cerberus-media + cerberus-images

## What Needs Work
- `www.cerberuslive.studio` redirect to the apex (optional; apex is canonical)
- Delete the orphan `cerberuslive` waitlist worker deployment (operator: `bunx wrangler delete
  --name cerberuslive`; repo source already removed)
- Phase 2+ depth: admin-hosted R2 track-upload tier; waitlist -> invite migration; Resend
  signup confirmations
- DMARC / magic-link junk-folder deliverability
- CerberusAgent: NSIS installer + desktop GUI run-through (own repo + docs now)

## Notes
The Phase 0 waitlist worker is retired; its `waitlist` table + rows are preserved in D1 and
surfaced in /admin. Cross-workshop threads tracked in Q:\MTW\Docs\OPEN-LOOPS.md (L-030 done,
L-044, L-045).
