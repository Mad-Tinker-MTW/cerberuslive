-- Cerberus Live Studio — support messages (control deck Inbox, Phase E)
-- Inbound problem reports / contact from the public contact form. The control
-- deck Inbox lists these; the owner can resolve or reply (reply emails via Resend).
CREATE TABLE IF NOT EXISTS support_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT,                          -- set when the sender was signed in
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',   -- open | resolved
  admin_reply TEXT,
  replied_at  TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_status ON support_messages(status, created_at);
