// scripts/runMigration.js
// Runs the production-safe migration SQL against the PostgreSQL database.
// Loads DATABASE_URL from .env (or the environment, e.g. Render's env vars).
//
// Usage:
//   npm run db:migrate
//   (or: node scripts/runMigration.js)
//
// The migration is idempotent — safe to run more than once.

const fs = require('fs');
const path = require('path');

// Load .env file FIRST (from the server root directory)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Client } = require('pg');
const { getPgConfig } = require('../src/dbConfig');

const MIGRATION_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  'db',
  'migrate_refresh_tokens.sql'
);

async function runMigration() {
  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env or environment variables.');
    console.error('   Please set DATABASE_URL before running this script.');
    process.exit(1);
  }

  // Read the migration file
  let sql;
  try {
    sql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
    console.log(`📄 Migration file loaded: ${MIGRATION_PATH}`);
  } catch (err) {
    console.error(`❌ ERROR: Could not read migration file: ${MIGRATION_PATH}`);
    console.error(`   ${err.message}`);
    process.exit(1);
  }

  // Connect to PostgreSQL and execute the migration
  const client = new Client(getPgConfig());

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully.');

    console.log('🗄️  Running migration: add expires_at to refresh_tokens...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');
    console.log('   - expires_at column added (or already existed).');
    console.log('   - Existing rows backfilled with created_at + 7 days.');
    console.log('   - NOT NULL constraint enforced.');
    console.log('   - DEFAULT (NOW() + INTERVAL 7 days) set for future inserts.');
  } catch (err) {
    console.error('❌ ERROR: Migration failed. The transaction was rolled back.');
    console.error(`   ${err.message}`);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

runMigration();
