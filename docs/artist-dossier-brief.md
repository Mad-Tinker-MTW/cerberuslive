# Cerberus Live Studio — Artist Dossier Page (v1 build brief)

Source: Franky's build brief 2026-06-28 (with STCO mockup). Replaces the current
minimal /artist/[slug] with a rich, data-driven "talent dossier + booking" page.
Concept line: "This artist is ready to perform, and Cerberus has the file." NOT a social profile.

## Feel
Underground, clean, cinematic, tactical, high-contrast, red accent. Mix of EPK +
talent catalog + booking page + target dossier. Avoid: nightclub-flyer, cartoon,
corporate, social-media-clone, high text density.

## Palette
--bg #050505 · --panel #101010 · --panel-soft #151515 · --border #2a2a2a
--text #f2f2f2 · --muted #8f8f8f · --red #d71920 · --red-soft #7a1115 · --green #28c76f
(Tune our current theme toward this: darker bg, brighter red.)

## Layout (desktop)
Sticky header · left artist sidebar · main content · dossier card in hero · card sections.
Mobile stacks: header → portrait card → hero/dossier → featured media → tabs → overview cards → booking.

## Sections
1. Header: logo, nav (Discover Artists, Live Streams, Shows, About, Contact), search "Search artists...", notif + user icons.
2. Sidebar: vertical headshot + "Verified Artist" overlay; Book Artist (primary) + Message (secondary); Quick Info card; social row (IG/YT/TikTok/Spotify/SoundCloud/Web); Dossier ID card (CLS-XXXX-001 + barcode + Cerberus watermark).
   Quick Info: Location, Genres, Performance Type, Set Length, Travel Range, Status, Response Time.
3. Hero: name + verification mark + subtitle/meaning + genre/role tags + Cerberus Dossier table (Class, Signal, Gate Status, Booking Range, Clearance, Member Since; Signal/Gate green when good).
4. Featured Track card: thumbnail + play overlay, title, artist, fake waveform, time "0:00/3:24", platform buttons (Spotify/YouTube/SoundCloud/Share). Static UI ok.
5. Tabs (UI only v1, Overview active): Overview · Media · Live Sets · Booking & Availability · Press Kit · Reviews.
6. Overview grid: About card; Sound & Style; Best For (icon tiles: Club Shows/Open Mics/Colleges/Festivals/Community Events); Performance Profile (Set Length, Type, Crowd Fit, Clean Set, Languages, Stage Presence stars, Energy, Equipment, Travel); Media Highlights (4 thumbs + View All Media).
7. Booking: Upcoming Availability week strip (green Available / red Booked + View Full Calendar); Booking Request card (Request Booking button + booking@cerberuslive.studio).

## Components (React)
SiteHeader, ArtistSidebar, QuickInfoCard, DossierIdCard, DossierHero, FeaturedTrackCard,
ProfileTabs, AboutArtistCard, PerformanceProfileCard, MediaHighlightsCard, AvailabilityCard, BookingRequestCard.

## Seed artist (STCO / CLS-STCO-001)
Full object in the conversation transcript 2026-06-28. Key: name STCO, meaning "Self Truth Sees Cypher",
Oklahoma City OK, Hip-Hop/Conscious Rap, Live Rapper/Vocalist, 30-45 min, Available for Booking,
featured "Rise Above" 3:24, 7-day availability strip, booking@cerberuslive.studio.

## v1 scope (static OK)
Responsive, seeded data, static media/waveform, booking button + email link, availability strip,
tabs UI, mobile stacking, hover states. NO auth/backend/real audio/calendar/db/uploads yet.

## Future
Artist account creation, media uploads, booking form backend, public/private fields, calendar,
press-kit downloads, admin verification, search/filter directory, live-stream embeds, venue accounts.

## Build notes for next session
- This expands the D1 `artist_profiles` schema a LOT (performance profile, availability, featured track,
  media, socials, dossier fields). Make it data-driven and DEGRADE GRACEFULLY (missing fields hide their
  card / badge; design for a 30%-complete profile, not just polished STCO).
- Keep SSR + SEO (the reason we run Next).
- Dossier ID format reuses the CLS- prefix (matches PMP doc IDs). Nice consistency.

## Verification and Reviews (trust model)
- "Verified Artist" is EARNED, not self-declared: granted after the artist completes a
  booking THROUGH the site AND a customer leaves a review. The badge means real proof.
- Reviews are ADMIN-MODERATED: they route to Franky, who approves before publish. He
  passes positives, tracks neutrals and negatives.
- Escalation: repeated negatives to an artist trigger a warning, then removal of booking
  ability. Marketplace governance keeps quality high. This gate IS the Cerberus brand.
- Data model adds: a `reviews` table (status pending/approved/rejected, sentiment, links
  to a booking + artist + reviewer), `bookings` records, and a `verified` flag on the
  artist that is admin-set / computed from (completed booking + at least one approved review).
- Scale note: manual review approval is fine at launch but becomes a bottleneck later;
  plan a lightweight admin moderation queue.
- Maps to the dossier hero: Signal = "Media Verified" only once earned; Gate Status open/closed
  reflects booking standing (closed if removed for negatives).

## Platform direction addendum (captured 2026-06-28)

### Security posture — the guardianship principle (LOCKED)
A guarded gate, not an unbreakable vault: make theft hard, make every breach traceable, make it
not worth it. Layered cost + attribution, stated openly. NEVER promise "100% protected." Artist-facing
line: "We can't make it un-stealable, nobody can; we make it hard, prove it's yours, and trace where it
leaked." This honesty IS the brand and builds trust instead of setting up a broken promise. Goes in TOS.

### Creator / label model
Support a creator/label HUB that owns multiple artist personas (e.g., one human producer running 3 AI
artists, ~6 tracks each). Hub = where commissions route + the human story lives. Each persona = its own
dossier + catalog, distinct sound preserved. A "one lyric, many artists, many genres" piece = signature showcase.

### Offerings / licensing model
Every track carries offering flags (default OFF): stream/use-as-is, remix, license (sync), buy-out
(= EXCLUSIVE LICENSE + pulled from catalog, NOT a copyright transfer), commission (hire the creator).
It is a LICENSING marketplace — selling usage, not ownership — which sidesteps the AI-copyright question.
CTAs flex by artist type: live performer to "Book Artist"; recording/AI artist to "License / Remix / Buy / Commission."

### Rights / IP reality (AI music via paid Suno)
Paid Suno = commercial-use rights (sell, license, distribute, sync), but NO guaranteed copyright protection
on AI audio. Human-authored LYRICS are the protectable IP. So: sell LICENSES (clean), frame buy-out as an
exclusive license, register lyrics for real protection. Per-listing rights language required. Get a lawyer to
review the license template before selling at volume. (Not legal advice.)

### Access / visibility
Private-by-default. States: Private to Unlisted (link-only) to Public. Per-offering, per-grant access
(remix stays closed unless granted to a specific person). Maps to dossier "Gate Status." Files live on the
artist's machine (self-hosted via cloudflared tunnel); listeners stream THROUGH Cerberus.

### Provenance and anti-theft
- Auto-ingest on upload: read Suno MP3 tags to pre-fill track + provenance. VERIFIED on a real file:
  `comment = made with suno; created=<ISO>; id=<uuid>` plus title, artist, and full lyrics embedded.
- Authorship anchors (do NOT rely on your own DB date alone): the Suno track id (server-verifiable),
  a file SHA-256 hash + public timestamp (OpenTimestamps), public-post dates, and registered lyrics.
- Fingerprint (Chromaprint/AcoustID) = registry/identify ("same song"). Watermark (AudioSeal, per-listener)
  = traitor-tracing ("which copy leaked, from whose session"). This is attribution + deterrence, NOT
  prevention (the analog hole means capture can't be stopped). Phasing: register fingerprint + hash + provenance
  NOW; per-stream watermark + a detection sweep LATER (Phase 3+). Do not block launch on watermarking.

### AI-artist transparency
Label AI artists openly (dossier Class: "AI Artist / AI-Assisted"). Most platforms ban or hide AI music;
Cerberus leaning in honestly is a differentiator and a trust signal. Cerberus can own the AI-artist showcase niche.
