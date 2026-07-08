-- Cerberus Live Studio — dossier-ID generation (L-057 / signup rework)
-- Per-tier counter for auto-assigned dossier IDs (CLS-<TIER><digit><letter>-<NNN>, letters-forward),
-- plus a uniqueness guard so generated IDs and admin custom-overrides can never collide.
-- SQLite UNIQUE allows multiple NULLs, so un-assigned dossiers are fine.

CREATE TABLE IF NOT EXISTS dossier_seq (
  tier TEXT PRIMARY KEY,       -- 'free' | 'plus' | 'managed'
  n    INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_dossier_id ON artist_profiles(dossier_id);
