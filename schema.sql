-- Cerberus Live Studio — D1 Schema
-- Run this once in Cloudflare D1 dashboard or via wrangler

CREATE TABLE IF NOT EXISTS waitlist (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  role       TEXT    NOT NULL CHECK(role IN ('artist', 'venue', 'fan', 'managed')),
  created_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_role ON waitlist(role);
CREATE INDEX IF NOT EXISTS idx_created ON waitlist(created_at);

-- Query examples you'll use:

-- All signups by role
-- SELECT role, COUNT(*) as count FROM waitlist GROUP BY role;

-- Export artist list
-- SELECT email, created_at FROM waitlist WHERE role = 'artist' ORDER BY created_at;

-- Export managed artist leads
-- SELECT email, created_at FROM waitlist WHERE role = 'managed' ORDER BY created_at;

-- Full list newest first
-- SELECT * FROM waitlist ORDER BY created_at DESC;
