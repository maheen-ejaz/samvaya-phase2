-- ============================================================
-- Seed Data Cleanup — Run in Supabase SQL Editor BEFORE testing
-- ============================================================
-- This removes all rows created by seed-demo-profiles.mjs and
-- seed-demo-user.mjs.
--
-- All seed accounts use the domain @demo.samvaya.test.
-- Deleting from auth.users cascades to all FK-linked tables:
--   users, profiles, compatibility_profiles, partner_preferences,
--   work_experience, photos, documents, payments, ai_conversations,
--   match_suggestions (as requester/candidate), match_presentations,
--   activity_logs (where user_id matches), communications_log, etc.
--
-- Run in a transaction so you can roll back if something looks wrong.
-- ============================================================

BEGIN;

-- 1. Collect seed user IDs
CREATE TEMP TABLE seed_user_ids AS
SELECT id
FROM auth.users
WHERE email LIKE '%@demo.samvaya.test'
   OR email LIKE '%@samvayatest.com'    -- e2e test accounts
   OR email LIKE '%@test.samvaya%';     -- any other test variants

-- 2. Preview what will be deleted (comment out after verifying)
SELECT au.email, u.payment_status, u.membership_status
FROM seed_user_ids s
JOIN auth.users au ON au.id = s.id
LEFT JOIN users u ON u.id = s.id
ORDER BY au.email;

-- 3. Delete match_suggestions (has two FK columns: requester_id, candidate_id)
DELETE FROM match_suggestions
WHERE requester_id IN (SELECT id FROM seed_user_ids)
   OR candidate_id IN (SELECT id FROM seed_user_ids);

-- 4. Delete match_presentations (has two FK columns: user1_id, user2_id)
DELETE FROM match_presentations
WHERE user1_id IN (SELECT id FROM seed_user_ids)
   OR user2_id IN (SELECT id FROM seed_user_ids);

-- 5. Delete introductions (has two FK columns: user1_id, user2_id)
DELETE FROM introductions
WHERE user1_id IN (SELECT id FROM seed_user_ids)
   OR user2_id IN (SELECT id FROM seed_user_ids);

-- 6. Delete activity_log entries for these users
DELETE FROM activity_log
WHERE actor_id IN (SELECT id FROM seed_user_ids)
   OR target_user_id IN (SELECT id FROM seed_user_ids);

-- 7. Delete communication_log entries
DELETE FROM communication_log
WHERE user_id IN (SELECT id FROM seed_user_ids)
   OR sent_by IN (SELECT id FROM seed_user_ids);

-- 8. Delete admin tasks referencing these users
DELETE FROM admin_tasks
WHERE related_user_id IN (SELECT id FROM seed_user_ids);

-- 9. Delete daily_snapshots (these are aggregate rows — leave them,
--    they'll repopulate on next snapshot cron run; no user FK here)

-- 10. Delete the auth users — cascades to: users, profiles,
--     compatibility_profiles, partner_preferences, work_experience,
--     photos, documents, payments, ai_conversations, push_subscriptions,
--     introduction_availability, bgv_checks
DELETE FROM auth.users
WHERE id IN (SELECT id FROM seed_user_ids);

-- 11. Drop temp table
DROP TABLE seed_user_ids;

-- ============================================================
-- Verify nothing remains
-- ============================================================
SELECT count(*) AS remaining_seed_users
FROM auth.users
WHERE email LIKE '%@demo.samvaya.test'
   OR email LIKE '%@samvayatest.com';

-- If count = 0, commit. Otherwise ROLLBACK and investigate.
COMMIT;
