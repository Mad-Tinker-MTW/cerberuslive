-- Cerberus Live Studio — artist types: personas / releases / discography (L-048, Phase 1)
-- Additive. Applied to the shared cerberus-waitlist D1.
--
-- Model: Artist (artist_profiles) -> personas (solo|group) -> releases (album|ep|single)
-- -> tracks. A track with no release_id and no persona_id is a "direct single" (the
-- artist's own lane). Group personas carry a members[] JSON list; group "versions"
-- releases use the per-track version_label + performer credits. personas + releases each
-- carry a dedication/story field (the differentiator). Every column is nullable so the
-- dossier keeps degrading gracefully: a simple one-persona artist still renders flat.

-- Roles the artist performs (comma-separated, like genre_tags): songwriter, producer, dj, singer...
ALTER TABLE artist_profiles ADD COLUMN roles TEXT;

CREATE TABLE IF NOT EXISTS personas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  slug         TEXT NOT NULL,                  -- unique within the artist
  name         TEXT NOT NULL,
  kind         TEXT NOT NULL DEFAULT 'solo',   -- 'solo' | 'group'
  members      TEXT,                           -- JSON array [{name, role?}] for group personas
  bio          TEXT,
  dedication   TEXT,                           -- the story / who-it-is-for field
  sort         INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  UNIQUE (artist_slug, slug)
);
CREATE INDEX IF NOT EXISTS idx_personas_artist ON personas(artist_slug);

CREATE TABLE IF NOT EXISTS releases (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  persona_id   INTEGER,                        -- NULL = the artist's direct/self lane
  title        TEXT NOT NULL,
  kind         TEXT NOT NULL DEFAULT 'single', -- 'album' | 'ep' | 'single'
  year         TEXT,
  cover_url    TEXT,
  dedication   TEXT,
  sort         INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_releases_artist ON releases(artist_slug);
CREATE INDEX IF NOT EXISTS idx_releases_persona ON releases(persona_id);

-- Discography columns on tracks. A track with release_id NULL + persona_id NULL is a direct single.
ALTER TABLE tracks ADD COLUMN release_id    INTEGER;
ALTER TABLE tracks ADD COLUMN persona_id    INTEGER;
ALTER TABLE tracks ADD COLUMN version_label TEXT;    -- e.g. "Trap Version" (group "versions" releases)
ALTER TABLE tracks ADD COLUMN performer     TEXT;    -- group member credit for this version
ALTER TABLE tracks ADD COLUMN composer      TEXT;    -- the human creator (from the Composer tag)
ALTER TABLE tracks ADD COLUMN track_no      INTEGER; -- Track # within the release
CREATE INDEX IF NOT EXISTS idx_tracks_release ON tracks(release_id);
