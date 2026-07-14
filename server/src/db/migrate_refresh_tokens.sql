-- ============================================================================
-- Migration: Add expires_at column to refresh_tokens
-- ============================================================================
-- Safe for production (Render PostgreSQL).
-- Idempotent: uses ADD COLUMN IF NOT EXISTS — safe to run multiple times.
-- Does NOT drop the table or delete any rows.
--
-- Steps:
--   1. Add expires_at column if it does not already exist (nullable first).
--   2. Set a DEFAULT so future inserts without expires_at do not fail.
--   3. Backfill existing rows using COALESCE(created_at, NOW()) + 7 days.
--   4. Enforce NOT NULL now that every row has a value.
--
-- How to run on Render:
--   npm run db:migrate
--   (Requires DATABASE_URL to be set in the environment / .env file)
-- ============================================================================

BEGIN;

-- Step 1: Add the column (nullable first)
-- If the column already exists this is a no-op — safe to run again.
ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Step 2: Set a DEFAULT so inserts without an explicit value won't fail.
-- This protects against older code paths or unexpected inserts.
ALTER TABLE refresh_tokens
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '7 days');

-- Step 3: Backfill existing rows that have no expires_at.
-- COALESCE guards against rows where created_at itself might be NULL.
UPDATE refresh_tokens
   SET expires_at = COALESCE(created_at, NOW()) + INTERVAL '7 days'
 WHERE expires_at IS NULL;

-- Step 4: Enforce NOT NULL now that every row has a value.
ALTER TABLE refresh_tokens
  ALTER COLUMN expires_at SET NOT NULL;

COMMIT;
