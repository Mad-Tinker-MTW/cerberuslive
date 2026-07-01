-- Cerberus Live Studio — desktop-agent device authorization flow (RFC 8628 adapted).
-- Desktop app calls POST /api/auth/device to start a grant, shows the human user_code,
-- and polls POST /api/auth/device/token with the opaque device_code. In a browser the
-- artist visits /device, signs in, and approves (or denies) the pending grant. On
-- successful poll, the row is marked consumed and the agent key is rotated.

CREATE TABLE device_grants (
  device_code TEXT PRIMARY KEY,
  user_code   TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | approved | denied | consumed | expired
  user_id     TEXT,                            -- set when a session-authed artist approves
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  last_poll_at TEXT
);

CREATE INDEX idx_device_grants_user_code ON device_grants(user_code);
CREATE INDEX idx_device_grants_expires_at ON device_grants(expires_at);
