-- Cerberus Live Studio — fan follow system (Phase 1, WBS 1.2.7)
-- A signed-in fan follows an artist. One row per (artist, fan).
CREATE TABLE IF NOT EXISTS follows (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug TEXT NOT NULL,
  fan_user_id TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  UNIQUE (artist_slug, fan_user_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_artist ON follows(artist_slug);
CREATE INDEX IF NOT EXISTS idx_follows_fan ON follows(fan_user_id);
