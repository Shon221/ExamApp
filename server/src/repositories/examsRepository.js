// src/repositories/examsRepository.js
// PostgreSQL data access for lecturer exam management routes.

const pool = require('../db');
const mockData = require('../data/mockData');

const LEGACY_USER_IDS = {
  1: '11111111-1111-4111-8111-111111111111',
  2: '22222222-2222-4222-8222-222222222222',
};

const LEGACY_USER_UUIDS = Object.entries(LEGACY_USER_IDS).reduce((acc, [legacyId, uuid]) => {
  acc[uuid] = legacyId;
  return acc;
}, {});

const LEGACY_EXAM_IDS = {
  exam1: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  exam2: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
};

const LEGACY_EXAM_UUIDS = Object.entries(LEGACY_EXAM_IDS).reduce((acc, [legacyId, uuid]) => {
  acc[uuid] = legacyId;
  return acc;
}, {});

const toDbUserId = (userId) => LEGACY_USER_IDS[userId] || userId;
const toDbExamId = (examId) => LEGACY_EXAM_IDS[examId] || examId;
const toApiUserId = (userId) => LEGACY_USER_UUIDS[userId] || userId;
const toApiExamId = (examId) => LEGACY_EXAM_UUIDS[examId] || examId;

const getQuestionIdsForExam = (apiExamId) => {
  const legacyExam = mockData.exams.find((exam) => exam.id === apiExamId);
  return legacyExam?.questions || [];
};

const toApiExam = (row) => {
  if (!row) {
    return null;
  }

  const id = toApiExamId(row.id);

  return {
    id,
    title: row.title,
    instructions: row.instructions || '',
    lecturer_id: toApiUserId(row.lecturer_id),
    status: row.status,
    duration_minutes: row.duration_minutes,
    passing_score: row.passing_score,
    questions: getQuestionIdsForExam(id),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const getExamsByLecturer = async (lecturerId) => {
  const result = await pool.query(
    `SELECT id, title, instructions, lecturer_id, status, duration_minutes,
            passing_score, created_at, updated_at
       FROM exams
      WHERE lecturer_id = $1
      ORDER BY created_at DESC`,
    [toDbUserId(lecturerId)]
  );

  return result.rows.map(toApiExam);
};

const getExamById = async (examId) => {
  const result = await pool.query(
    `SELECT id, title, instructions, lecturer_id, status, duration_minutes,
            passing_score, created_at, updated_at
       FROM exams
      WHERE id = $1`,
    [toDbExamId(examId)]
  );

  return toApiExam(result.rows[0]);
};

const createExam = async (examData, lecturerId) => {
  const result = await pool.query(
    `INSERT INTO exams (
       title, instructions, lecturer_id, status, duration_minutes, passing_score
     )
     VALUES ($1, $2, $3, 'draft', $4, $5)
     RETURNING id, title, instructions, lecturer_id, status, duration_minutes,
               passing_score, created_at, updated_at`,
    [
      examData.title,
      examData.instructions || '',
      toDbUserId(lecturerId),
      examData.duration_minutes,
      examData.passing_score,
    ]
  );

  return toApiExam(result.rows[0]);
};

const updateExam = async (examId, updates) => {
  const result = await pool.query(
    `UPDATE exams
        SET title = $2,
            instructions = COALESCE($3, instructions),
            duration_minutes = $4,
            passing_score = $5,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, instructions, lecturer_id, status, duration_minutes,
                passing_score, created_at, updated_at`,
    [
      toDbExamId(examId),
      updates.title,
      updates.instructions,
      updates.duration_minutes,
      updates.passing_score,
    ]
  );

  return toApiExam(result.rows[0]);
};

const deleteExam = async (examId) => {
  const result = await pool.query(
    'DELETE FROM exams WHERE id = $1 RETURNING id',
    [toDbExamId(examId)]
  );

  return result.rowCount > 0;
};

const updateExamStatus = async (examId, status) => {
  const result = await pool.query(
    `UPDATE exams
        SET status = $2,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, instructions, lecturer_id, status, duration_minutes,
                passing_score, created_at, updated_at`,
    [toDbExamId(examId), status]
  );

  return toApiExam(result.rows[0]);
};

module.exports = {
  LEGACY_USER_IDS,
  LEGACY_EXAM_IDS,
  getExamsByLecturer,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  updateExamStatus,
};
