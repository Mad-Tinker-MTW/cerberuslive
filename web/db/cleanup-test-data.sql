-- Cerberus Live Studio — prune the staging auth test data from PROD D1.
-- Run from web/:  bunx wrangler d1 execute cerberus-waitlist --remote --file=db/cleanup-test-data.sql
-- Scoped to the test account only. Leaves seed artists (STCO + the 3) and the waitlist intact.
-- D1 Time Travel can restore if needed.

-- The Mad Tinker test artist profile (claimed during the smoke test)
DELETE FROM artist_profiles WHERE slug = 'mad-tinker';

-- Better Auth rows for the test user (sessions, accounts, then the user)
DELETE FROM session WHERE userId IN (SELECT id FROM user WHERE email = 'mad.tinker@outlook.com');
DELETE FROM account WHERE userId IN (SELECT id FROM user WHERE email = 'mad.tinker@outlook.com');
DELETE FROM verification WHERE identifier LIKE '%mad.tinker@outlook.com%';
DELETE FROM user WHERE email = 'mad.tinker@outlook.com';

-- OPTIONAL (uncomment to also clear the original Phase 0 waitlist test row):
-- DELETE FROM waitlist WHERE email = 'mad.tinker@outlook.com';
