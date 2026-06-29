-- Cerberus Live Studio — FULL content + auth wipe for a virgin run.
-- Run from web/:  bunx wrangler d1 execute cerberus-waitlist --remote --file=db/cleanup-all.sql
--
-- Clears every artist, all artist content, and all Better Auth accounts so the operator can
-- sign up as the first real user. KEEPS the Phase 0 `waitlist` table rows and the schema.
-- D1 Time Travel can restore if needed. Destructive: confirm before running on prod.

DELETE FROM reviews;
DELETE FROM follows;
DELETE FROM bookings;
DELETE FROM tracks;
DELETE FROM artist_profiles;

DELETE FROM session;
DELETE FROM account;
DELETE FROM verification;
DELETE FROM "user";
