-- Cerberus Live Studio — artist label + managed imprint (L-057 label field)
-- Additive. Two distinct things:
--   label           the artist's OWN label / production company (e.g. "Mad Tinkers Music
--                   Productions"). Artist-editable free text. Renders as the release label of record.
--   managed_imprint an ADMIN-granted flag, never self-editable and only meaningful for a managed
--                   artist. When 1, the dossier shows "Cerberus Live Studio" as the label of record
--                   (Cerberus produced/distributed it), overriding the artist's own label. This is a
--                   credential like verification, granted from the control deck, not a user choice.

ALTER TABLE artist_profiles ADD COLUMN label TEXT;
ALTER TABLE artist_profiles ADD COLUMN managed_imprint INTEGER NOT NULL DEFAULT 0;
