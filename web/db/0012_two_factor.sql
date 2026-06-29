-- Cerberus Live Studio — Better Auth two-factor (authenticator TOTP) for the owner.
-- Matches the better-auth two-factor plugin schema. Booleans are INTEGER 0/1,
-- dates are ISO TEXT, ids are TEXT (D1 / SqliteDialect conventions).
ALTER TABLE user ADD COLUMN twoFactorEnabled INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS twoFactor (
  id                      TEXT NOT NULL PRIMARY KEY,
  secret                  TEXT NOT NULL,
  backupCodes             TEXT NOT NULL,
  userId                  TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  verified                INTEGER NOT NULL DEFAULT 1,
  failedVerificationCount INTEGER NOT NULL DEFAULT 0,
  lockedUntil             TEXT
);

CREATE INDEX IF NOT EXISTS idx_twofactor_userid ON twoFactor(userId);
CREATE INDEX IF NOT EXISTS idx_twofactor_secret ON twoFactor(secret);
