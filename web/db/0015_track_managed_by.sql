-- Cerberus Live Studio — agent/web track ownership split (L-048, Phase 3)
-- Additive. The self-host agent owns the tracks it scans; the web Discography editor
-- owns the rest. The agent's register sync replaces only managed_by='agent' rows, so
-- web-curated tracks (and all persona/release dedications) survive a re-sync.

ALTER TABLE tracks ADD COLUMN managed_by TEXT NOT NULL DEFAULT 'web'; -- 'agent' | 'web'
