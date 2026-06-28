-- Cerberus Live Studio — artist dossier fields (Phase 1, L-028)
-- Additive ALTER on artist_profiles in the shared cerberus-waitlist D1.
-- Every column is nullable so the dossier page degrades gracefully: a missing
-- field hides its row/card/badge. Design target is a 30%-complete profile, not
-- only the fully-seeded STCO showcase.

ALTER TABLE artist_profiles ADD COLUMN subtitle            TEXT;   -- name meaning, e.g. "Self Truth Sees Cypher"
ALTER TABLE artist_profiles ADD COLUMN dossier_id          TEXT;   -- CLS-XXXX-001, reuses the CLS- PMP prefix
ALTER TABLE artist_profiles ADD COLUMN artist_class        TEXT;   -- "Live Rapper / Vocalist", "AI Artist / AI-Assisted"
ALTER TABLE artist_profiles ADD COLUMN performance_type    TEXT;   -- Quick Info
ALTER TABLE artist_profiles ADD COLUMN set_length          TEXT;
ALTER TABLE artist_profiles ADD COLUMN travel_range        TEXT;
ALTER TABLE artist_profiles ADD COLUMN availability_status TEXT;   -- "Available for Booking"
ALTER TABLE artist_profiles ADD COLUMN response_time       TEXT;
ALTER TABLE artist_profiles ADD COLUMN member_since        TEXT;
ALTER TABLE artist_profiles ADD COLUMN verified            INTEGER NOT NULL DEFAULT 0; -- EARNED, admin-set
ALTER TABLE artist_profiles ADD COLUMN booking_range       TEXT;   -- dossier table
ALTER TABLE artist_profiles ADD COLUMN clearance           TEXT;
ALTER TABLE artist_profiles ADD COLUMN signal_status       TEXT;   -- "Media Verified" once earned
ALTER TABLE artist_profiles ADD COLUMN gate_status         TEXT;   -- "Open" / "Closed" booking standing
ALTER TABLE artist_profiles ADD COLUMN sound_style         TEXT;
ALTER TABLE artist_profiles ADD COLUMN booking_email       TEXT;
ALTER TABLE artist_profiles ADD COLUMN profile_json        TEXT;   -- JSON: featuredTrack, performanceProfile, bestFor[], media[], availability[]

-- Seed artist: STCO (CLS-STCO-001), the fully-populated showcase from the brief.
INSERT OR IGNORE INTO artist_profiles
  (slug, display_name, bio, city, genre_tags, photo_url, social_links, tier, created_at,
   subtitle, dossier_id, artist_class, performance_type, set_length, travel_range,
   availability_status, response_time, member_since, verified, booking_range, clearance,
   signal_status, gate_status, sound_style, booking_email, profile_json)
VALUES
  ('stco', 'STCO',
   'Conscious rap out of Oklahoma City. STCO turns lived truth into live performance, bars built to move a room and leave it thinking.',
   'Oklahoma City, OK', 'Hip-Hop,Conscious Rap', NULL,
   '{"instagram":"https://instagram.com/stco","youtube":"https://youtube.com/@stco","spotify":"https://open.spotify.com/artist/stco","soundcloud":"https://soundcloud.com/stco"}',
   'managed', '2026-06-28T14:00:00Z',
   'Self Truth Sees Cypher', 'CLS-STCO-001', 'Live Rapper / Vocalist', 'Live Rapper / Vocalist',
   '30-45 min', 'Regional (OK / TX / KS)', 'Available for Booking', 'Within 24 hours',
   'June 2026', 1, '$300 - $750', 'Verified', 'Media Verified', 'Open',
   'Boom-bap foundations with a modern low end. Story-first writing, clean enough for a college stage, sharp enough for a late club set.',
   'booking@cerberuslive.studio',
   '{"featuredTrack":{"title":"Rise Above","artist":"STCO","duration":"3:24"},"performanceProfile":{"setLength":"30-45 min","type":"Live Rapper / Vocalist","crowdFit":"Clubs, Colleges, Festivals","cleanSet":"Available on request","languages":"English","stagePresence":4,"energy":"High","equipment":"Brings own mic + IEMs","travel":"Regional (OK / TX / KS)"},"bestFor":["Club Shows","Open Mics","Colleges","Festivals","Community Events"],"media":[{"title":"Rise Above (Live)"},{"title":"Cypher Session 01"},{"title":"OKC Rooftop Set"},{"title":"Behind the Verse"}],"availability":[{"day":"Mon","state":"available"},{"day":"Tue","state":"available"},{"day":"Wed","state":"booked"},{"day":"Thu","state":"available"},{"day":"Fri","state":"booked"},{"day":"Sat","state":"available"},{"day":"Sun","state":"available"}]}');

-- Partially enrich one existing artist (proves graceful degradation: some cards
-- present, many fields null). The other two stay sparse on purpose.
UPDATE artist_profiles SET
  dossier_id = 'CLS-NYX-001',
  artist_class = 'AI Artist / AI-Assisted',
  performance_type = 'DJ / Producer Set',
  set_length = '60-90 min',
  availability_status = 'Available for Booking',
  member_since = 'June 2026',
  gate_status = 'Open',
  sound_style = 'Cathedral-scale darkwave: granular static, slow builds, a low end you feel in the floor.',
  booking_email = 'booking@cerberuslive.studio'
WHERE slug = 'nyx-prowl';
