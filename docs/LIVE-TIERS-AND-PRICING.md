# Cerberus — Live Tiers & Pricing (plan)

**Date:** 2026-06-30. Planning doc, NOT yet built. Captures the pricing model and the live-build
tasks decided across the 2026-06-29/30 sessions, to be implemented after the Cloudflare Realtime
SFU media path is verified. Live runs on the Cloudflare Realtime **Serverless SFU** (subscribed
2026-06-30, 1 TB free real-time GB/month, then $0.05/GB).

## Cost model (Realtime SFU)
The SFU bills per "Real-time GB", the media data it relays to each viewer. Two facts drive everything:
- **Cap = concurrent viewers** (a ceiling on simultaneous connections), not a total headcount. When
  a viewer leaves, the slot frees and refills; the (cap+1)th joiner is blocked until a slot opens.
- **Bill = connected viewer-minutes**, accrued per minute, not flat per session and not per unique
  person. A viewer who watches 8 of 30 minutes costs 8 viewer-minutes.

Conversion shortcut: **MB per viewer-minute = Mbps x 7.5** (1 Mbps x 60s / 8 bits = 7.5 MB/min).

Cost formula:
```
cost = viewer_minutes x (Mbps x 7.5) MB / 1000 GB x $0.05
```
Worst-case (price-against) ceiling per tier:
```
ceiling_GB/mo = weekly_minutes x viewer_cap x 4.345 x (Mbps x 7.5) / 1000
```
The first artists are effectively free under the account-wide 1 TB; $0.05/GB is the true marginal
cost beyond that, pooled across all artists.

## Tier ladder
| Tier | Live allowance | Concurrent cap | Bitrate cap | Session bounds | Worst-case CF cost/mo | Price |
|---|---|---|---|---|---|---|
| Free | 10 min / week | 25 | ~0.7 Mbps | 5-10 min | ~$1 | $0 |
| Self-managed + | 90 min / week (flexible) | 50 | ~1 Mbps | 5-60 min | ~$7 | $29.99 |
| Managed | unmetered windows + produced showcases & venue auditions | higher | per event | per event | their SFU (~$7) + ~$15-30 per Stream showcase + labor | flat X (labor-based) |

Key decisions:
- **Sell a weekly minute BUDGET, not fixed sessions.** Self-managed+ is "90 live minutes a week,
  your way": the artist spends them as 6 x 15, 3 x 30, 2 x 45, or 1 x 90. Cost is bounded the same
  however they split it, because the ceiling is weekly_minutes x viewer_cap.
- **Cap the bitrate** so a popular artist cannot drift the cost up (1 Mbps for self-managed+ keeps
  the ceiling ~$7/mo; 1.5 Mbps would be ~$11.7/mo).
- **$29.99 has ~$20+/mo margin** at worst case, near-100% in practice. The "5x Cloudflare cost"
  rule sanity-checks it (~$7 cost x 5 = ~$35), and $29.99 reads friendlier for underground artists.
- **Managed price is labor-based, not CF-based.** It covers the showcases/auditions you produce
  (Cloudflare Stream Live) plus your time. The SFU is a rounding error against it.

## Performance modes (audio is the differentiator)
Auto-selected from the artist's `roles` (L-048). Video target is similar across types; the audio
profile and the voice-DSP setting are what change.

- **Stage mode (music: DJ, singer, band):** stereo Opus ~128 kbps; voice DSP **OFF**
  (`echoCancellation`, `noiseSuppression`, `autoGainControl` all false, because they pump/duck/gut
  music and duck a singer's voice under the backing track); audio-input-device picker so the artist
  captures their mixer/interface, not a room mic. Video 480p (DJ) to 720p (singer, the face is the show).
- **Mic mode (spoken: comedian, host, poet):** mono Opus ~64 kbps; light noise suppression is OK
  but NOT aggressive (it eats audience laughter/ambience). Video 480-720p. Cheapest type.

Per-type worst-case (90 min/wk x 50 viewers):
| Type | Audio | Video | Total | ~Cost/mo |
|---|---|---|---|---|
| DJ | stereo 128k | 480p | ~0.85 Mbps | ~$6 |
| Singer | stereo 128k | 720p | ~1.6 Mbps | ~$11.7 |
| Comedian | mono 64k | 480-720p | ~0.75-1.0 Mbps | ~$5.5-8 |

## Showcases / auditions (Managed tier, Cloudflare Stream Live)
The SFU is per-viewer and best for small interactive windows. For a real audience, use **Stream
Live** (one ingest, HLS fan-out over the CDN): the "centrally located, scales cheaply" path.
- Billed ~$0.001 per delivered minute + ~$0.005/min stored (recording).
- A 90-min showcase to ~150 viewers ~ $15. A venue audition (short, tiny audience) ~ cents.
- Truly near-zero per-viewer is possible later by teeing the HLS into R2 (free Cloudflare egress).

## In-show interaction and auth
Principle: a viewer never navigates away from a live. Every action happens in an overlay with the
video still playing behind it.
- **Reactions / likes:** anonymous and ephemeral, sent over the SFU data channel. No sign-in, ever.
- **Follow (deferred-follow model):** an anonymous viewer taps Follow and enters an email; it returns
  instantly and they keep watching. A pending `follow_intents` row is stored (email, artist_slug,
  session_id, token, status, created_at) and is NOT a follow yet. When the show ends, a confirm email
  goes out ("you vibed with X's set, confirm to follow"); clicking it creates/links the account AND
  records the follow in one step. Unconfirmed intents are purged after 7 days. A signed-in viewer
  follows immediately (skips the flow). Rate-limit submits so nobody mails confirms to other people.
- **Account auth generally:** keep magic link for normal account creation; add email OTP (reuses
  Resend, in-modal, no window juggling) and Google OAuth (one-tap, needs Google creds) as low-friction
  options; passkeys as a returning-user accelerator.

## Admin moderation
- Admin (role=admin) gets an **uncapped, gating-bypass viewer slot** on any live (exempt check in
  `/api/live/rtc`), so the operator can drop into any stream to check for abuse without taking a fan slot.
- Control-deck "Live now" panel: list active sessions, watch any, **force-end (kill)** an abusive one.
- **Report button** on every watch page feeding the existing support inbox.

## Follower communication and social (the main free-vs-managed differentiator)
Reach is the upsell.
- **All tiers:** a profile feed on the dossier. Posts have visibility **public** (world) or
  **followers-only** (private to signed-in followers). Table `posts` (artist_slug, body, media?,
  visibility, created_at); followers-only gated by the follow relationship.
- **Managed perk:** Cerberus **auto-sends email blasts** to the artist's followers on updates, new
  posts, and going live (push reach, using the consented follower emails). A core reason to upgrade.
- **Non-managed:** pull only. Followers see updates by visiting the profile plus in-app notifications
  and the live badge (already built). No auto-email; that is the managed upsell.
- **Going live:** managed sends an "X is live now" email; non-managed shows the in-app live badge.
- **Compliance:** per-artist follower email opt-out / unsubscribe, clear sender identity, deliverability
  (DMARC). Email volume (Resend) is covered by the managed fee. The deferred-follow double opt-in keeps
  the blast list clean and consented by construction.

## Events and showcases (system)
- A public **calendar** of upcoming specials, showcases, and auditions. Event (host/artists, datetime,
  type [special|showcase|audition], access [free|followers|ticketed] + price, capacity).
- **Two signup roles per event:** **perform** (artist applies, admin approves, gets a slot) and
  **watch** (RSVP free, or buy a ticket for PPV).
- Delivery: Stream Live for ticketed/large audiences, SFU for small; the same gate/entitlement check
  runs before issuing the player.
- Tickets need Stripe (Phase 6). Free RSVP, followers-only, and apply-to-perform ship before Stripe.
- Managed-tier curation; ties to the commission model and ticket minimums.

### Audition funnel + event page (casting via the calendar)
The home-page schedule is two-sided: it advertises shows to viewers AND recruits performers. A
showcase runs as a funnel:
1. **Open call** posted to the calendar: "Looking for comedians, showcase X/X/XX, live auditions
   X/X/XX, book your 3-min slot for a 5-min set."
2. **Audition slot booking** (Calendly-style): the audition event has time slots (e.g. 3-min each);
   artists claim an open slot. Slots table (event_id, start, duration, status open|claimed,
   artist_slug); one claim each, no double-booking. Keep auditions FREE (pay-to-audition is predatory
   and shrinks the funnel; you want max applicants to find talent).
3. **Live auditions** on the day: each artist goes live in their 3-min slot (SFU window); admin
   watches live and/or reviews the recording.
4. **Selection:** admin advances ~10 acts into the lineup (5-min sets) plus a headliner. Notify all:
   scheduled -> reminder -> result (advanced / thanks).
5. **Event page = the PPV sales page:** shows the curated lineup with the headliner featured and every
   performer as a card that **links through to their dossier** (`/artist/[slug]`), so viewers can vet
   who is on before buying. This sells tickets (social proof) AND cross-promotes every act (dossier
   visits -> deferred-follow -> discovery), so the show grows all 10 followings whether or not a
   given viewer buys.
6. **Showcase + PPV** runs per the event economics above.
No-show handling: over-book or waitlist audition slots, require a confirm.
**Managed priority:** managed artists get first pick and reserved/guaranteed slots in showcases and
events (priority placement, and they can skip or get fast-tracked through auditions). Remaining open
slots are released to non-managed and open-call applicants afterward. Another managed-tier perk.
**Flywheel:** open call brings NEW artists to audition (acquisition) -> the lineup page sells tickets
and grows every performer's following -> viewers convert via deferred-follow -> strong acts feed venue
bookings (your commission). Each show compounds the next.

## Build tasks (next stage, after SFU verified)
1. ~~Verify the SFU media path end-to-end~~ **VERIFIED 2026-06-30** on prod: SFU app created +
   secrets set, publisher camera published, and a signed-out phone viewer saw live video
   (publish -> SFU -> subscribe all confirmed). Server side also confirmed: live_sessions.provider_id
   minted + `/api/live/rtc` returns a session. Remaining live polish:
   - Viewer "connecting" state (avoid the broken-image flash before the first frame).
   - Detect stream-end on the viewer (show "stream ended" instead of the frozen last frame; listen
     for peer-connection / track close).
   - Enforce the concurrent-viewer cap at join (count active viewers in `/api/live/rtc`, refuse the
     (cap+1)th).
2. **Tier-aware caps + enforcement** in `/api/live`: a weekly-minute budget ledger per artist
   (track used, reset weekly, block start when exhausted), concurrent-cap enforced at join (count
   active viewers in `/api/live/rtc`, refuse the (cap+1)th), session min/max, bitrate cap.
3. **Tier-aware SFU app selection**: add `CF_REALTIME_APP_ID_PAID` / `_TOKEN`; pick the app by
   artist tier in `lib/live.ts` (free app vs paid app for clean per-tier accounting; note the 1 TB
   free is account-pooled, so a second app is for accounting/isolation, not a second free quota).
4. **Performance modes** (Stage / Mic) driven by `roles`, plus an audio-input-device picker and a
   480p/720p toggle in the go-live control.
5. **Managed Stream Live event path** end-to-end: live-input creation is scaffolded; verify RTMP in
   + HLS player out, then add a scheduling / showcase / audition system.
6. **Remaining-minutes UX** in `/account` (show the weekly budget and what's left).
7. **(Later)** Stream -> R2 HLS tee for near-zero-egress large broadcasts.

## Build phasing (full live + social roadmap)
**Phase A (no new infra):** deferred-follow (follow_intents + post-show confirm email + 7-day purge);
anonymous reactions overlay; admin moderation (uncapped/gate-bypass slot, Live-now panel + force-end,
report button); concurrency-cap enforcement; tier caps + weekly-minute budget + bitrate caps;
remaining-minutes UX; viewer connecting/stream-ended polish.
**Phase B (light setup):** performance modes (Stage/Mic from roles) + audio-device picker + 480p/720p
toggle; profile feed (public + followers-only posts); managed auto-email follower blasts (Resend +
per-artist unsubscribe); account auth options (email OTP + Google OAuth); followers-only live gating.
**Phase C (needs Stripe + Stream verify):** verify the managed Stream Live event path (RTMP in + HLS
out); events/showcase calendar (apply-to-perform + RSVP); ticketed PPV via Stripe (entitlement gate
before the player); Stream -> R2 HLS tee for near-zero-egress large broadcasts.

### Tier comms differentiator
| Channel | Free / self-managed | Managed |
|---|---|---|
| Follower reach | profile feed (pull) + in-app / live badge | + auto email blasts (push) |
| Going live | live badge + in-app | + "X is live now" email |
| Posts | public + followers-only on profile | + emailed to followers |
| Events | apply for open slots (after managed are placed) | priority / guaranteed slots + curated, produced, and promoted by Cerberus |

## Pricing summary
Free $0 / Self-managed+ $29.99 (1 Mbps cap) / Managed flat-X (labor + showcases). Worst-case
self-managed+ infra cost is under $3/week (~$7/mo); margin is 4x or better and most usage rides the
free 1 TB at $0. Price live on value and your time, not Cloudflare cost.
