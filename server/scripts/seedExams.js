// scripts/seedExams.js
// Seeds PostgreSQL with the existing mock users and exams needed by exam routes.

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Client } = require('pg');
const mockData = require('../src/data/mockData');

const LEGACY_USER_IDS = {
  1: '11111111-1111-4111-8111-111111111111',
  2: '22222222-2222-4222-8222-222222222222',
};

const LEGACY_EXAM_IDS = {
  exam1: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  exam2: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
};

async function seedExams() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in .env or environment variables.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    for (const user of mockData.users) {
      const dbUserId = LEGACY_USER_IDS[user.id];

      if (!dbUserId) {
        continue;
      }

      await client.query(
        `INSERT INTO users (id, name, email, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               email = EXCLUDED.email,
               password = EXCLUDED.password,
               role = EXCLUDED.role`,
        [dbUserId, user.name, user.email, user.password, user.role, user.created_at]
      );
    }

    for (const exam of mockData.exams) {
      const dbExamId = LEGACY_EXAM_IDS[exam.id];
      const dbLecturerId = LEGACY_USER_IDS[exam.lecturer_id];

      if (!dbExamId || !dbLecturerId) {
        continue;
      }

      await client.query(
        `INSERT INTO exams (
           id, title, instructions, lecturer_id, status, duration_minutes,
           passing_score, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE
           SET title = EXCLUDED.title,
               instructions = EXCLUDED.instructions,
               lecturer_id = EXCLUDED.lecturer_id,
               status = EXCLUDED.status,
               duration_minutes = EXCLUDED.duration_minutes,
               passing_score = EXCLUDED.passing_score,
               updated_at = EXCLUDED.updated_at`,
        [
          dbExamId,
          exam.title,
          exam.instructions,
          dbLecturerId,
          exam.status,
          exam.duration_minutes,
          exam.passing_score,
          exam.created_at,
          exam.updated_at,
        ]
      );
    }

    console.log(`Seeded ${mockData.users.length} users and ${mockData.exams.length} exams into PostgreSQL.`);
  } catch (error) {
    console.error('ERROR: Failed to seed exams.');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedExams();
