-- Cerberus Live Studio — admin artist flags (suspend / feature).
-- suspended hides an artist from discovery + dossier + media; featured pins them in discovery.
-- Applied to the shared cerberus-waitlist D1.

ALTER TABLE artist_profiles ADD COLUMN suspended INTEGER NOT NULL DEFAULT 0;
ALTER TABLE artist_profiles ADD COLUMN featured  INTEGER NOT NULL DEFAULT 0;
