-- Cerberus Live Studio — deferred-follow intents (L-048 Phase A)
-- A viewer can tap Follow mid-show and just leave an email; it returns instantly and they keep
-- watching. The row is a PENDING intent, not a follow. When the show ends, a confirm email goes
-- out; clicking it flips the intent to CONFIRMED (an email-only follower, feeds managed blasts).
-- Unconfirmed intents are purged after 7 days.

CREATE TABLE IF NOT EXISTS follow_intents (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  email        TEXT NOT NULL,
  session_id   INTEGER,                          -- the live session it was captured during (if any)
  token        TEXT NOT NULL UNIQUE,             -- confirm-link token
  status       TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'confirmed'
  created_at   TEXT NOT NULL,
  emailed_at   TEXT,                             -- when the confirm email was sent (on show end)
  confirmed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_follow_intents_artist ON follow_intents(artist_slug);
CREATE INDEX IF NOT EXISTS idx_follow_intents_token ON follow_intents(token);
CREATE INDEX IF NOT EXISTS idx_follow_intents_status ON follow_intents(status);
