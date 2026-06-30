-- Cerberus Live Studio — concurrent-viewer heartbeat (L-048 Phase A.6)
-- Enforces the per-tier viewer_cap on a free WebRTC window. Each viewer holds a row keyed by a
-- client-generated token and heartbeats it every ~10s; a row whose last_seen falls stale (a closed
-- tab, a missed beat) is purged on write so its slot frees. Admins and the artist themselves bypass
-- the cap and never get a row. D1-backed (no Durable Object), same MVP pattern as live_reactions.

CREATE TABLE IF NOT EXISTS live_viewers (
  session_id   INTEGER NOT NULL,   -- live_sessions.id this viewer is watching
  artist_slug  TEXT NOT NULL,
  viewer_token TEXT NOT NULL,       -- opaque per-tab id (crypto.randomUUID on the client)
  last_seen    TEXT NOT NULL,
  PRIMARY KEY (session_id, viewer_token)
);
CREATE INDEX IF NOT EXISTS idx_live_viewers_session ON live_viewers(session_id, last_seen);
