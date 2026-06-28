-- Cerberus Live Studio — Better Auth tables (Phase 1, L-029)
-- Better Auth core schema for the SQLite/D1 (kysely) adapter. For sqlite the
-- adapter runs with supportsDates=false and supportsBooleans=false, so dates are
-- stored as ISO strings (TEXT) and booleans as INTEGER (0/1).
-- `role` is an additionalField on user (artist / fan / venue / admin), default fan.
-- Applied to the shared cerberus-waitlist D1.

CREATE TABLE IF NOT EXISTS user (
  id             TEXT NOT NULL PRIMARY KEY,
  name           TEXT,
  email          TEXT NOT NULL UNIQUE,
  emailVerified  INTEGER NOT NULL DEFAULT 0,
  image          TEXT,
  role           TEXT DEFAULT 'fan',
  createdAt      TEXT NOT NULL,
  updatedAt      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id         TEXT NOT NULL PRIMARY KEY,
  expiresAt  TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  createdAt  TEXT NOT NULL,
  updatedAt  TEXT NOT NULL,
  ipAddress  TEXT,
  userAgent  TEXT,
  userId     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);

CREATE TABLE IF NOT EXISTS account (
  id                     TEXT NOT NULL PRIMARY KEY,
  accountId              TEXT NOT NULL,
  providerId             TEXT NOT NULL,
  userId                 TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken            TEXT,
  refreshToken           TEXT,
  idToken                TEXT,
  accessTokenExpiresAt   TEXT,
  refreshTokenExpiresAt  TEXT,
  scope                  TEXT,
  password               TEXT,
  createdAt              TEXT NOT NULL,
  updatedAt              TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);

CREATE TABLE IF NOT EXISTS verification (
  id          TEXT NOT NULL PRIMARY KEY,
  identifier  TEXT NOT NULL,
  value       TEXT NOT NULL,
  expiresAt   TEXT NOT NULL,
  createdAt   TEXT,
  updatedAt   TEXT
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
