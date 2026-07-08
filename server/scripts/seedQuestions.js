// scripts/seedQuestions.js
// Seeds PostgreSQL questions from the existing mock data.

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Client } = require('pg');
const mockData = require('../src/data/mockData');

const LEGACY_EXAM_IDS = {
  exam1: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  exam2: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
};

const LEGACY_QUESTION_IDS = {
  q1: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  q2: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  q3: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
};

async function seedQuestions() {
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

    for (const question of mockData.questions) {
      const dbQuestionId = LEGACY_QUESTION_IDS[question.id];
      const dbExamId = LEGACY_EXAM_IDS[question.exam_id];

      if (!dbQuestionId || !dbExamId) {
        continue;
      }

      await client.query(
        `INSERT INTO questions (
           id, exam_id, type, text, options, correct_answer, "order", points
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE
           SET exam_id = EXCLUDED.exam_id,
               type = EXCLUDED.type,
               text = EXCLUDED.text,
               options = EXCLUDED.options,
               correct_answer = EXCLUDED.correct_answer,
               "order" = EXCLUDED."order",
               points = EXCLUDED.points`,
        [
          dbQuestionId,
          dbExamId,
          question.type,
          question.text,
          question.options || [],
          question.correct_answer,
          question.order,
          question.points,
        ]
      );
    }

    console.log(`Seeded ${mockData.questions.length} questions into PostgreSQL.`);
  } catch (error) {
    console.error('ERROR: Failed to seed questions.');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedQuestions();
