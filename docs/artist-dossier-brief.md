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
