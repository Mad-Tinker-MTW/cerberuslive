-- Cerberus Live Studio — media self-host + bookings (Phase 2/4 foundation)
-- Additive. Applied to the shared cerberus-waitlist D1.

-- Artist columns for the self-host agent + notification routing.
ALTER TABLE artist_profiles ADD COLUMN tunnel_url    TEXT;  -- cloudflared URL the agent registers
ALTER TABLE artist_profiles ADD COLUMN contact_email TEXT;  -- artist's personal notify email (falls back to user.email)
ALTER TABLE artist_profiles ADD COLUMN agent_key     TEXT;  -- per-artist token the desktop agent authenticates with

-- Media tracks an artist self-hosts (served through their tunnel_url) or admin-hosts.
CREATE TABLE IF NOT EXISTS tracks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug  TEXT NOT NULL,
  title        TEXT NOT NULL,
  filename     TEXT NOT NULL,        -- path under the tunnel root, e.g. "Chaos Dancer.mp3"
  duration     TEXT,                 -- "3:24"
  is_featured  INTEGER NOT NULL DEFAULT 0,
  sort         INTEGER NOT NULL DEFAULT 0,
  source       TEXT NOT NULL DEFAULT 'self',  -- 'self' (tunnel) | 'r2' (admin-hosted)
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tracks_slug ON tracks(artist_slug);

-- Booking requests. Notifications route to the artist's contact email, or to the
-- admin when the artist is managed (tier='managed').
CREATE TABLE IF NOT EXISTS bookings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_slug     TEXT NOT NULL,
  requester_name  TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  event_date      TEXT,
  message         TEXT,
  kind            TEXT NOT NULL DEFAULT 'booking',  -- 'booking' | 'message'
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | accepted | declined
  routed_to       TEXT,                              -- email the notification was sent to
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_slug ON bookings(artist_slug);
