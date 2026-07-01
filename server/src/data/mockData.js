// src/data/mockData.js
// This is our "database" for now — just JavaScript objects stored in memory.
// When the server restarts, all changes are lost (that is expected for mock data).
//
// IMPORTANT: Passwords are generated at startup using bcrypt.
// Both mock users have password: 123456
// You can log in with:
//   lecturer@example.com / 123456
//   student@example.com / 123456

const bcrypt = require('bcrypt');

// We generate the hashes synchronously at startup (only once).
// bcryptSync is used here because this runs once before the server starts accepting requests.
const HASHED_PASSWORD = bcrypt.hashSync('123456', 10);

const mockData = {
  // ─── Users ───────────────────────────────────────────────────────────────────
  users: [
    {
      id: '1',
      name: 'John Lecturer',
      email: 'lecturer@example.com',
      password: HASHED_PASSWORD,
      role: 'lecturer',
      created_at: new Date('2024-01-01T10:00:00.000Z'),
    },
    {
      id: '2',
      name: 'Jane Student',
      email: 'student@example.com',
      password: HASHED_PASSWORD,
      role: 'student',
      created_at: new Date('2024-01-02T10:00:00.000Z'),
    },
  ],

  // ─── Exams ───────────────────────────────────────────────────────────────────
  exams: [
    {
      id: 'exam1',
      title: 'Math Exam',
      instructions: 'Answer all questions carefully. Show your work where needed.',
      lecturer_id: '1',
      status: 'published',         // lowercase: draft | published | archived
      duration_minutes: 60,
      passing_score: 70,
      questions: ['q1', 'q2', 'q3'], // array of question IDs
      created_at: new Date('2024-01-10T10:00:00.000Z'),
      updated_at: new Date('2024-01-10T10:00:00.000Z'),
    },
    {
      id: 'exam2',
      title: 'JavaScript Basics',
      instructions: 'Test on fundamental JavaScript concepts.',
      lecturer_id: '1',
      status: 'draft',
      duration_minutes: 45,
      passing_score: 60,
      questions: [],
      created_at: new Date('2024-01-15T10:00:00.000Z'),
      updated_at: new Date('2024-01-15T10:00:00.000Z'),
    },
  ],

  // ─── Questions ───────────────────────────────────────────────────────────────
  questions: [
    {
      id: 'q1',
      exam_id: 'exam1',
      type: 'multiple-choice',
      text: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correct_answer: '4',          // NEVER sent to students before submission
      order: 1,
      points: 10,
    },
    {
      id: 'q2',
      exam_id: 'exam1',
      type: 'multiple-choice',
      text: 'What is the square root of 16?',
      options: ['2', '4', '6', '8'],
      correct_answer: '4',
      order: 2,
      points: 10,
    },
    {
      id: 'q3',
      exam_id: 'exam1',
      type: 'multiple-choice',
      text: 'What is 10 × 10?',
      options: ['10', '100', '1000', '10000'],
      correct_answer: '100',
      order: 3,
      points: 10,
    },
  ],

  // ─── Submissions ─────────────────────────────────────────────────────────────
  submissions: [
    {
      id: 's1',
      exam_id: 'exam1',
      student_id: '2',
      answers: [
        { question_id: 'q1', answer: '4',   is_correct: true,  points_earned: 10 },
        { question_id: 'q2', answer: '4',   is_correct: true,  points_earned: 10 },
        { question_id: 'q3', answer: '100', is_correct: true,  points_earned: 10 },
      ],
      score: 100,           // percentage: 0–100
      total_points_earned: 30,
      total_possible_points: 30,
      status: 'graded',
      submitted_at: new Date('2024-01-20T12:00:00.000Z'),
      time_spent_minutes: 45,
    },
  ],

  // ─── Drafts ──────────────────────────────────────────────────────────────────
  // Stores in-progress exams for students
  drafts: [],

  // ─── Refresh Tokens ──────────────────────────────────────────────────────────
  // Stores valid refresh tokens so we can invalidate them on logout
  refreshTokens: [],
};

module.exports = mockData;
