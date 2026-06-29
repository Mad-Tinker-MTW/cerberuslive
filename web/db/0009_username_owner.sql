-- Cerberus Live Studio — Better Auth username plugin columns (owner/admin password login).
-- Adds username + displayUsername to user so the site owner (mad.tinker) can sign in with a
-- username + password, alongside the passwordless magic-link flow everyone else uses.
-- Applied to the shared cerberus-waitlist D1.

ALTER TABLE user ADD COLUMN username        TEXT;
ALTER TABLE user ADD COLUMN displayUsername TEXT;

-- Unique usernames (NULLs allowed: magic-link users have none).
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON user(username);
