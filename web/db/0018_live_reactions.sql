-- Cerberus Live Studio — ephemeral live reactions (L-048 Phase A)
-- Anonymous floating reactions during a live window. Rows are short-lived: viewers poll the
-- last few seconds to animate them, and rows older than ~2 minutes are purged on write. No
-- account required. Kept in D1 (cheap, bursty) rather than a Durable Object for the MVP.

CREATE TABLE IF NOT EXISTS live_reactions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  emoji        TEXT NOT NULL,   -- key from a fixed set: heart | fire | laugh | clap | wow
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_live_reactions_slug ON live_reactions(artist_slug, created_at);
