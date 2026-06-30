# Cerberus — Artist Types & Media Model (design capture)

**Date:** 2026-06-29. Design session, not yet built. This is the resume point for the artist-types build.

## Core principle: free = the window, paid = the service
- **Free:** artist self-hosts (PC agent serves files via tunnel) plus a lightweight live "window". Cerberus stores nothing, cost ~$0. Their stuff is online only when their PC is on; scale capped by their home connection.
- **Managed/paid:** Cerberus hosts the media (R2, always-on, scales, free egress) and produces live events. Cost is covered by the management fee.
- **Correction needed:** the current media gateway caches EVERY artist into R2 (`MEDIA.put` on miss), so it durably holds free artists' files. That violates the model and gives away the paid product. The gateway must become **tier-aware**: `source='self'`/free = tunnel pass-through, no `MEDIA.put`; paid = R2-hosted. This also keeps the free R2 allowance for paying customers and keeps Cerberus a conduit, not a host (cleaner liability).

## Artist model: roles + content-composed sections (not rigid templates)
- Artist picks **roles** (songwriter, producer, DJ, singer...). The dossier composes the sections that fit the media they actually have (discography, video, live). Degrades to a flat layout for a simple one-persona artist.
- **Hierarchy:** Artist -> personas (solo or group) -> releases (album / EP / single) -> tracks. Plus a "self / direct" lane for the artist's own releases (no persona). Group personas carry a short **members** list; a track can carry a **version label** + **performer** credit (used by group "versions" releases, ignored otherwise).
- **New differentiator:** a **dedication / story** field on personas and releases. Each album can carry its meaning (who it is for, why it exists), shown next to the music. This is what makes the page mean something instead of being a catalog.

## Two apps
- **PC = the studio** (CerberusAgent, expanded): create / organize / publish, type-aware, reads file tags to auto-build the discography. Free artists must use it (media is local).
- **Phone = a PWA** (the site, installable): monitor (stats / bookings / messages), play, light edits. NOT a native app.
- **Where you edit:** creation = PC. Web editing = a managed perk (R2-backed), so managed artists can stop running the agent entirely. That is a concrete reason to upgrade.

## Tags / auto-import
- Build the discography from embedded file tags: **Artist = persona**, **Album = release**, **Album Artist = persona**, **Track #**, **Genre**, **Composer = the human creator**, embedded cover art. Importer should be forgiving.
- Tool: **AudioRanger** or **Mp3tag** as a BATCH editor. Auto-identify (MusicBrainz / AcoustID fingerprint) will NOT work on original / unreleased music; use them only for bulk manual tagging + organization.

## Live (two products, by tier)
- **Free "window":** WebRTC (Cloudflare Realtime) camera/screen share, capped minutes + a viewer cap. Watch = no sign-in; go on camera = sign-in (gives moderation). Near-zero cost, small/intimate by design.
- **Managed "event":** Cloudflare Stream Live (RTMP/SRT ingest, HLS fan-out, scales). Produced / promoted auditions and multi-artist showcases (a real events/scheduling system). Cost is metered per viewer-minute and covered by the management fee. **Live is the one cost center** (R2 egress is free; Stream is not), so free live must stay capped.

## R2 economics (confirmed)
- Free tier: 10 GB storage, 1M writes, 10M reads/month; **egress FREE**. Overage cheap ($0.015/GB-month storage). Paid hosting has strong margins: storing a catalog is pennies/month and serving it is free.

## Agent bug to fix
- `src/agent.mjs` does a **flat root scan** (`readdirSync` of the top level only) **once at startup**, with **no folder watcher**. The owner's files are now in per-persona subfolders, so the flat scan finds 0, and adding files never re-registers. Needs: **recursive scan**, **folder = persona**, and a **file watcher / re-sync** (or a "Re-sync library" button). The `/api/agent/register` route already REPLACES the `source='self'` track set, so a restart is a full sync once the scan is fixed.

## Owner (f-de-la-paz) catalog structure — the test artist
- **3 solo persona albums:** Bianca Raveena (5 tracks), Scarlett Knight (4), Styrling Shadow (5). Album names TBD. Candidates discussed: Bianca = "A Warrior's Lullaby"; Scarlett = "Velvet and Venom"; Styrling = TBD.
- **KWC group EP "Riding with Sexy":** one song in four genre versions, each performed by a different member of the group.
- **3 direct singles** (the owner's own, voice-modified), no persona.
- Each album carries a **deeply personal dedication**; this is the reason the story field matters. (Personal context stays private; only the feature need is recorded here.)

## Proposed build order
1. Roles + personas/releases data model + type-aware dossier (discography + dedication). Test on the owner's catalog.
2. Video lane (DJ side).
3. Agent rework: recursive / persona-aware scan + file watcher + type-aware publish.
4. PWA the phone.
5. Media gateway tier-realignment (free = tunnel pass-through, no R2; paid = R2-hosted).
6. Live: free WebRTC window first, then managed Stream Live events + the showcase/events system.

## Build status (2026-06-29)
All six phases built locally; typecheck + lint clean, media unit tests green. Local-only;
prod deploy (migrations 0013-0016 + CI push + secrets) is operator-gated.

1. DONE. Migration 0013 (personas/releases + track discography columns + roles). getDiscography
   assembler; type-aware Discography tab (personas -> releases -> tracks + persona singles +
   direct lane) with the dedication/story field at persona + release level. Full web CRUD editor
   (/account/discography + /api/discography, ownership-checked, deletes orphan tracks not destroy)
   + roles chips. Verified live on the seeded owner catalog (solo albums, KWC group EP with genre
   versions, direct singles).
2. DONE. Migration 0014 (tracks.media_kind). Video renders in a conditional "Live Sets" tab
   (VideoList) + inline video in discography; editor media-kind control; gateway + agent video MIME.
   Verified: a video track renders a <video> through the gateway URL.
3. DONE. Migration 0015 (tracks.managed_by). Agent (CerberusAgent/src/agent.mjs) rewritten:
   recursive scan, folder=persona / subfolder=release, ffprobe tag auto-import (Album Artist/Album/
   Track/Composer/Title), video extensions + MIME, debounced fs.watch re-sync. /api/agent/register
   reconciles: replaces only managed_by='agent' tracks, find-or-creates personas/releases by name
   (preserving artist-edited dedications). Verified end-to-end against D1: reuse-not-duplicate,
   web tracks survive, idempotent re-sync, persona-singles for loose files.
4. DONE. Installable PWA: app/manifest.ts (standalone, theme, icons), maskable icon, service
   worker (network-first nav + offline fallback, never caches media/API), SW registration, apple
   meta + viewport. Verified: manifest 200, SW active (scope /), offline page cached.
5. DONE. Gateway (media/) is tier-aware: free/self = pure tunnel pass-through (no R2 put, online
   only when the artist's PC is on); managed = R2 read-through cache. Video MIME added; +1 test.
   Pure logic unit-tested; the D1/R2 branch verifies at deploy (wrangler dev unusable on Windows).
6. BUILT, partly OPERATOR-GATED. Migration 0016 (live_sessions). Live-presence system (go-live /
   end-live with caps, LIVE badge on the dossier, /live/[slug] watch page) is fully working and
   verified. Free WebRTC "window" (Cloudflare Realtime/Calls publisher + viewer via a token-hiding
   /api/live/rtc proxy) and managed "event" (Cloudflare Stream Live input creation + HLS iframe
   embed) are implemented but **need operator secrets and real-device verification**:
   CF_REALTIME_APP_ID + CF_REALTIME_APP_TOKEN for the window; CF_API_TOKEN (Stream:Edit) +
   CF_ACCOUNT_ID for events. Without them the LIVE status still works and the watch page shows a
   clear "not configured" notice (verified). The Stream HLS iframe embed renders when a
   playback_id is present (verified). The WebRTC media path (camera publish + viewer subscribe)
   is coded against the documented Calls REST flow but is NOT yet verified end-to-end.

### Operator deploy steps (gated, not done here)
- Apply migrations 0013, 0014, 0015, 0016 to prod D1 (`wrangler d1 execute --remote`).
- `cd media && bunx wrangler deploy` (tier-aware gateway) and push web main (CI deploys).
- For live: provision a Cloudflare Realtime app + Stream, set the four secrets above on the web
  worker, then verify a real window (two devices) and a real event (OBS -> RTMP).
