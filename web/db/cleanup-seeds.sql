-- Cerberus Live Studio — remove the demo/seed artists for a clean launch roster.
-- Run from web/:  bunx wrangler d1 execute cerberus-waitlist --remote --file=db/cleanup-seeds.sql
-- Re-seedable later from db/0002_artist_dossier.sql if needed. D1 Time Travel can restore.
DELETE FROM artist_profiles WHERE slug IN ('stco', 'nyx-prowl', 'hollowpoint', 'static-saint');
