-- Cerberus Live Studio — video lane (L-048, Phase 2)
-- Additive. A track is audio by default; video tracks (DJ sets, performance clips)
-- stream through the same media gateway and render in the Live Sets tab.

ALTER TABLE tracks ADD COLUMN media_kind TEXT NOT NULL DEFAULT 'audio'; -- 'audio' | 'video'
