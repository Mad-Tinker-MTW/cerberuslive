-- Cerberus Live Studio — reviews + earned verification (trust model)
-- Reviews are admin-moderated: submitted as 'pending', approved/rejected by an admin.
-- Only approved reviews show publicly. "Verified Artist" is earned: a completed
-- booking + at least one approved review (admin confirms/sets the verified flag).
CREATE TABLE IF NOT EXISTS reviews (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug    TEXT NOT NULL,
  booking_id     INTEGER,                          -- optional link to a booking
  reviewer_name  TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating         INTEGER NOT NULL DEFAULT 5,       -- 1..5
  body           TEXT,
  sentiment      TEXT,                             -- positive | neutral | negative (derived from rating, admin can override)
  status         TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  created_at     TEXT NOT NULL,
  moderated_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_reviews_slug ON reviews(artist_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
