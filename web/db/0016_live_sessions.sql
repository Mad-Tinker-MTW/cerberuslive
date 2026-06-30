-- Cerberus Live Studio — live sessions (L-048, Phase 6)
-- Additive. Two live products by tier:
--   'window' = free WebRTC window (Cloudflare Realtime), capped minutes + viewers, intimate.
--   'event'  = managed Cloudflare Stream Live (RTMP/HLS), metered, fee-covered.
-- A row is created when an artist goes live and flipped to 'ended' when they stop. The
-- live SFU/ingest itself is provisioned by the platform (operator-gated CF credentials).

CREATE TABLE IF NOT EXISTS live_sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  kind         TEXT NOT NULL DEFAULT 'window',  -- 'window' | 'event'
  status       TEXT NOT NULL DEFAULT 'live',    -- 'live' | 'ended'
  title        TEXT,
  provider_id  TEXT,                            -- CF Realtime sessionId / Stream live input uid
  playback_id  TEXT,                            -- Stream HLS playback id (event tier)
  viewer_cap   INTEGER,
  minutes_cap  INTEGER,
  started_at   TEXT NOT NULL,
  ended_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_live_artist ON live_sessions(artist_slug);
CREATE INDEX IF NOT EXISTS idx_live_status ON live_sessions(status);
