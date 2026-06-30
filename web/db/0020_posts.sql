-- Cerberus Live Studio — artist profile feed (L-048 Phase B)
-- Posts on an artist's dossier. visibility 'public' is world-readable; 'followers' is gated to
-- signed-in followers (and the artist). This is the free-vs-managed social base: all tiers get the
-- pull feed here; the managed tier later adds auto-email blasts of these posts to followers.

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  body         TEXT NOT NULL,
  media_url    TEXT,                              -- reserved for later (image/clip attach)
  visibility   TEXT NOT NULL DEFAULT 'public',    -- 'public' | 'followers'
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(artist_slug, created_at);
