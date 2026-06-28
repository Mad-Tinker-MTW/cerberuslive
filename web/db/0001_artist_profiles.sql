-- Cerberus Live Studio — platform schema (Phase 1)
-- Applied to the cerberus-waitlist D1 (shared with the waitlist; additive only).

CREATE TABLE IF NOT EXISTS artist_profiles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT,                       -- links to Better Auth user.id once auth lands
  slug          TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  bio           TEXT,
  city          TEXT,
  genre_tags    TEXT,                        -- comma-separated
  photo_url     TEXT,
  social_links  TEXT,                        -- JSON
  tier          TEXT NOT NULL DEFAULT 'free',
  created_at    TEXT NOT NULL,
  updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_artist_slug ON artist_profiles(slug);

-- Seed artists so the public pages render immediately.
INSERT OR IGNORE INTO artist_profiles (slug, display_name, bio, city, genre_tags, tier, created_at) VALUES
 ('nyx-prowl',   'Nyx Prowl',    'Darkwave producer carving cathedrals out of static. Three heads, one sound.', 'Oklahoma City, OK', 'darkwave,industrial,techno', 'managed', '2026-06-28T13:40:00Z'),
 ('hollowpoint', 'Hollowpoint',  'Drill from the flatlands. Cold bars, colder nights.',                          'Tulsa, OK',         'drill,trap,hip-hop',        'free',    '2026-06-28T13:40:00Z'),
 ('static-saint','Static Saint', 'Noise liturgy and experimental dirges for the faithful few.',                  'Altus, OK',         'noise,experimental,ambient','free',    '2026-06-28T13:40:00Z');
