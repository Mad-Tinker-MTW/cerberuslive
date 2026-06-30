-- LOCAL-ONLY demo seed for L-048 Phase 1 verification (artist: mad-tinker).
-- Exercises the full discography hierarchy: solo persona albums, a group EP with
-- per-member genre versions, and direct singles. Dedication text is generic
-- placeholder to prove the render; the owner's real values go in via the editor.
-- Idempotent: clears this artist's personas/releases/self-tracks first.

DELETE FROM tracks   WHERE artist_slug = 'mad-tinker' AND source = 'self';
DELETE FROM releases WHERE artist_slug = 'mad-tinker';
DELETE FROM personas WHERE artist_slug = 'mad-tinker';

-- Roles drive type-aware section composition.
UPDATE artist_profiles SET roles = 'singer,songwriter,producer' WHERE slug = 'mad-tinker';

-- Personas: three solo + one group.
INSERT INTO personas (artist_slug, slug, name, kind, members, bio, dedication, sort, created_at) VALUES
 ('mad-tinker', 'bianca-raveena', 'Bianca Raveena', 'solo', NULL,
  'Cinematic alt-pop with a war drum underneath.',
  'For the ones who fought their hardest battles in the quiet hours.', 0, '2026-06-29T00:00:00Z'),
 ('mad-tinker', 'scarlett-knight', 'Scarlett Knight', 'solo', NULL,
  'Dark synth-pop, velvet over a blade.', NULL, 1, '2026-06-29T00:00:00Z'),
 ('mad-tinker', 'styrling-shadow', 'Styrling Shadow', 'solo', NULL,
  'Brooding electronic soundscapes.', NULL, 2, '2026-06-29T00:00:00Z'),
 ('mad-tinker', 'kwc', 'KWC', 'group',
  '[{"name":"Vex","role":"Trap"},{"name":"Lyra","role":"R&B"},{"name":"Drift","role":"House"},{"name":"Onyx","role":"Drill"}]',
  'Four voices, one record.', 'Made with the crew, for the crew.', 3, '2026-06-29T00:00:00Z');

-- Releases (persona_id resolved by lookup). Three albums, one EP.
INSERT INTO releases (artist_slug, persona_id, title, kind, year, dedication, sort, created_at) VALUES
 ('mad-tinker', (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='bianca-raveena'),
  'A Warrior''s Lullaby', 'album', '2026', 'Every song here is a letter I could not send.', 0, '2026-06-29T00:00:00Z'),
 ('mad-tinker', (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='scarlett-knight'),
  'Velvet and Venom', 'album', '2026', NULL, 0, '2026-06-29T00:00:00Z'),
 ('mad-tinker', (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='styrling-shadow'),
  'Ashes & Aether', 'album', '2026', NULL, 0, '2026-06-29T00:00:00Z'),
 ('mad-tinker', (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='kwc'),
  'Riding with Sexy', 'ep', '2026', 'One song, four ways, because none of us could agree.', 0, '2026-06-29T00:00:00Z');

-- A Warrior's Lullaby (5 tracks).
INSERT INTO tracks (artist_slug, title, filename, duration, is_featured, sort, source, created_at, release_id, persona_id, track_no) VALUES
 ('mad-tinker', 'Quiet Hours',      'bianca/01.mp3', '3:42', 1, 0, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='A Warrior''s Lullaby'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='bianca-raveena'), 1),
 ('mad-tinker', 'Battle Scars',     'bianca/02.mp3', '4:01', 0, 1, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='A Warrior''s Lullaby'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='bianca-raveena'), 2),
 ('mad-tinker', 'Lullaby',          'bianca/03.mp3', '3:15', 0, 2, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='A Warrior''s Lullaby'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='bianca-raveena'), 3),
 ('mad-tinker', 'Hold the Line',    'bianca/04.mp3', '3:58', 0, 3, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='A Warrior''s Lullaby'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='bianca-raveena'), 4),
 ('mad-tinker', 'Coming Home',      'bianca/05.mp3', '4:20', 0, 4, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='A Warrior''s Lullaby'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='bianca-raveena'), 5);

-- Velvet and Venom (4 tracks).
INSERT INTO tracks (artist_slug, title, filename, duration, is_featured, sort, source, created_at, release_id, persona_id, track_no) VALUES
 ('mad-tinker', 'Velvet',           'scarlett/01.mp3', '3:30', 0, 0, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Velvet and Venom'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='scarlett-knight'), 1),
 ('mad-tinker', 'Venom',            'scarlett/02.mp3', '3:48', 0, 1, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Velvet and Venom'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='scarlett-knight'), 2),
 ('mad-tinker', 'Nightshade',       'scarlett/03.mp3', '4:05', 0, 2, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Velvet and Venom'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='scarlett-knight'), 3),
 ('mad-tinker', 'Antidote',         'scarlett/04.mp3', '3:22', 0, 3, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Velvet and Venom'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='scarlett-knight'), 4);

-- Ashes & Aether (5 tracks).
INSERT INTO tracks (artist_slug, title, filename, duration, is_featured, sort, source, created_at, release_id, persona_id, track_no) VALUES
 ('mad-tinker', 'Ashfall',          'styrling/01.mp3', '5:10', 0, 0, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Ashes & Aether'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='styrling-shadow'), 1),
 ('mad-tinker', 'Aether Drift',     'styrling/02.mp3', '4:44', 0, 1, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Ashes & Aether'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='styrling-shadow'), 2),
 ('mad-tinker', 'Static Bloom',     'styrling/03.mp3', '4:02', 0, 2, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Ashes & Aether'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='styrling-shadow'), 3),
 ('mad-tinker', 'Embers',           'styrling/04.mp3', '3:51', 0, 3, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Ashes & Aether'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='styrling-shadow'), 4),
 ('mad-tinker', 'Afterglow',        'styrling/05.mp3', '6:18', 0, 4, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Ashes & Aether'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='styrling-shadow'), 5);

-- Riding with Sexy: one song, four genre versions, each by a different member.
INSERT INTO tracks (artist_slug, title, filename, duration, is_featured, sort, source, created_at, release_id, persona_id, version_label, performer, track_no) VALUES
 ('mad-tinker', 'Riding with Sexy', 'kwc/trap.mp3',  '3:12', 0, 0, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Riding with Sexy'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='kwc'), 'Trap Version',  'Vex',  1),
 ('mad-tinker', 'Riding with Sexy', 'kwc/rnb.mp3',   '3:34', 0, 1, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Riding with Sexy'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='kwc'), 'R&B Version',   'Lyra', 2),
 ('mad-tinker', 'Riding with Sexy', 'kwc/house.mp3', '4:08', 0, 2, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Riding with Sexy'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='kwc'), 'House Version', 'Drift', 3),
 ('mad-tinker', 'Riding with Sexy', 'kwc/drill.mp3', '2:58', 0, 3, 'self', '2026-06-29T00:00:00Z', (SELECT id FROM releases WHERE artist_slug='mad-tinker' AND title='Riding with Sexy'), (SELECT id FROM personas WHERE artist_slug='mad-tinker' AND slug='kwc'), 'Drill Version', 'Onyx', 4);

-- Three direct singles (no persona, no release), voice-modified owner releases.
INSERT INTO tracks (artist_slug, title, filename, duration, is_featured, sort, source, created_at) VALUES
 ('mad-tinker', 'Signal Lost',      'singles/signal-lost.mp3',      '3:05', 0, 0, 'self', '2026-06-29T00:00:00Z'),
 ('mad-tinker', 'Ghost Frequency',  'singles/ghost-frequency.mp3',  '3:40', 0, 1, 'self', '2026-06-29T00:00:00Z'),
 ('mad-tinker', 'Last Transmission','singles/last-transmission.mp3','4:12', 0, 2, 'self', '2026-06-29T00:00:00Z');
