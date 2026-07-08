-- Cerberus Live Studio — Better Auth admin plugin columns.
-- Enables repeatable admin onboarding (createUser / setRole / setUserPassword) so
-- new control-deck admins can be minted or promoted without a one-off manual seed.
-- Matches the better-auth admin plugin schema: booleans are INTEGER 0/1, dates are
-- ISO TEXT, ids are TEXT (D1 / SqliteDialect conventions). Applied to cerberus-waitlist.

ALTER TABLE user ADD COLUMN banned     INTEGER DEFAULT 0;
ALTER TABLE user ADD COLUMN banReason  TEXT;
ALTER TABLE user ADD COLUMN banExpires TEXT;

ALTER TABLE session ADD COLUMN impersonatedBy TEXT;
