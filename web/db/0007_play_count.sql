-- Cerberus Live Studio — track play counts (Phase 2)
ALTER TABLE tracks ADD COLUMN play_count INTEGER NOT NULL DEFAULT 0;
