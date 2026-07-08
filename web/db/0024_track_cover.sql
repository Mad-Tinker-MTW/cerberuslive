-- Cerberus Live Studio — per-track cover art (L-057 art model)
-- Additive. Albums/EPs share one release cover (releases.cover_url); a SINGLE (a track with
-- no release) needs its own art, and there was nowhere to store it. This adds a per-track
-- cover. When a track is grouped into a release, the release cover wins for display; a loose
-- single falls back to its own cover_url. Populated by the agent (embedded-art extraction) or
-- the client editor. Nullable, so tracks without art keep degrading to the placeholder tile.

ALTER TABLE tracks ADD COLUMN cover_url TEXT;
