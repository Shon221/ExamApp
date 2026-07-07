// scripts/runSchema.js
// One-time script to execute the PostgreSQL schema (src/db/schema.sql).
// Loads .env for DATABASE_URL, connects via pg, runs the SQL, then exits.
//
// Usage:
//   npm run db:schema
//   (or: node scripts/runSchema.js)
//
// NOTE: This script does NOT modify mockDB or any existing routes.
//       It only creates tables in the PostgreSQL database.

const fs = require('fs');
const path = require('path');

// Load .env file FIRST (from the server root directory)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Client } = require('pg');
const { getPgConfig } = require('../src/dbConfig');

const SCHEMA_PATH = path.resolve(__dirname, '..', 'src', 'db', 'schema.sql');

async function runSchema() {
  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env or environment variables.');
    console.error('   Please set DATABASE_URL before running this script.');
    process.exit(1);
  }

  // Read the schema file
  let sql;
  try {
    sql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    console.log(`📄 Schema file loaded: ${SCHEMA_PATH}`);
  } catch (err) {
    console.error(`❌ ERROR: Could not read schema file: ${SCHEMA_PATH}`);
    console.error(`   ${err.message}`);
    process.exit(1);
  }

  // Connect to PostgreSQL and execute the schema
  const client = new Client(getPgConfig());

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully.');

    console.log('🗄️  Executing schema...');
    await client.query(sql);
    console.log('✅ Schema executed successfully! All tables created.');
  } catch (err) {
    console.error('❌ ERROR: Schema execution failed.');
    console.error(`   ${err.message}`);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

runSchema();
