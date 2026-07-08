// scripts/seedAuthUsers.js
// Seeds PostgreSQL with the existing mock auth users.

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Client } = require('pg');
const mockData = require('../src/data/mockData');
const { getPgConfig } = require('../src/dbConfig');

const LEGACY_USER_IDS = {
  1: '11111111-1111-4111-8111-111111111111',
  2: '22222222-2222-4222-8222-222222222222',
};

async function seedAuthUsers() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in .env or environment variables.');
    process.exit(1);
  }

  const client = new Client(getPgConfig());

  try {
    await client.connect();

    for (const user of mockData.users) {
      const dbUserId = LEGACY_USER_IDS[user.id];

      if (!dbUserId) {
        continue;
      }

      await client.query(
        `INSERT INTO users (id, name, email, password, role, created_at)
         VALUES ($1, $2, LOWER($3), $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               email = EXCLUDED.email,
               password = EXCLUDED.password,
               role = EXCLUDED.role`,
        [dbUserId, user.name, user.email, user.password, user.role, user.created_at]
      );
    }

    console.log(`Seeded ${mockData.users.length} auth users into PostgreSQL.`);
  } catch (error) {
    console.error('ERROR: Failed to seed auth users.');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedAuthUsers();
