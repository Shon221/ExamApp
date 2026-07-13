// src/repositories/studentExamsRepository.js
// PostgreSQL read access for student published exam views.

const pool = require('../db');
const {
  LEGACY_USER_IDS,
  LEGACY_EXAM_IDS,
  toDbExamId,
} = require('./examsRepository');
const { toApiQuestionId } = require('./questionsRepository');

const LEGACY_USER_UUIDS = Object.entries(LEGACY_USER_IDS).reduce((acc, [legacyId, uuid]) => {
  acc[uuid] = legacyId;
  return acc;
}, {});

const LEGACY_EXAM_UUIDS = Object.entries(LEGACY_EXAM_IDS).reduce((acc, [legacyId, uuid]) => {
  acc[uuid] = legacyId;
  return acc;
}, {});

const toApiUserId = (userId) => LEGACY_USER_UUIDS[userId] || userId;
const toApiExamId = (examId) => LEGACY_EXAM_UUIDS[examId] || examId;

const toApiExam = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: toApiExamId(row.id),
    title: row.title,
    instructions: row.instructions || '',
    lecturer_id: toApiUserId(row.lecturer_id),
    status: row.status,
    duration_minutes: row.duration_minutes,
    passing_score: row.passing_score,
    questions: row.question_ids ? row.question_ids.map(toApiQuestionId) : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const toApiStudentQuestion = (row) => ({
  id: toApiQuestionId(row.id),
  exam_id: toApiExamId(row.exam_id),
  type: row.type,
  text: row.text,
  options: row.options || [],
  order: row.order,
  points: row.points,
  created_at: row.created_at,
});

const examSelect = `
  SELECT e.id, e.title, e.instructions, e.lecturer_id, e.status,
         e.duration_minutes, e.passing_score, e.created_at, e.updated_at,
         COALESCE(
           ARRAY_AGG(q.id ORDER BY q."order") FILTER (WHERE q.id IS NOT NULL),
           '{}'
         ) AS question_ids
    FROM exams e
    LEFT JOIN questions q ON q.exam_id = e.id
`;

const getPublishedExams = async () => {
  const result = await pool.query(
    `${examSelect}
      WHERE e.status = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
    ['published']
  );

  return result.rows.map(toApiExam);
};

const getPublishedExamById = async (examId) => {
  const result = await pool.query(
    `${examSelect}
      WHERE e.id = $1 AND e.status = $2
      GROUP BY e.id`,
    [toDbExamId(examId), 'published']
  );

  return toApiExam(result.rows[0]);
};

const getExamStatusById = async (examId) => {
  const result = await pool.query(
    'SELECT status FROM exams WHERE id = $1',
    [toDbExamId(examId)]
  );

  return result.rows[0]?.status || null;
};

const getPublishedExamQuestions = async (examId) => {
  const result = await pool.query(
    `SELECT q.id, q.exam_id, q.type, q.text, q.options, q."order", q.points, q.created_at
       FROM questions q
       INNER JOIN exams e ON e.id = q.exam_id
      WHERE q.exam_id = $1 AND e.status = $2
      ORDER BY q."order" ASC`,
    [toDbExamId(examId), 'published']
  );

  return result.rows.map(toApiStudentQuestion);
};

/**
 * Fetch questions for a submitted exam review.
 * Works regardless of exam status (exam may have been unpublished after submission).
 * correct_answer is intentionally excluded.
 */
const getReviewableQuestionsByExamId = async (examId) => {
  const result = await pool.query(
    `SELECT q.id, q.exam_id, q.type, q.text, q.options, q."order", q.points, q.created_at
       FROM questions q
      WHERE q.exam_id = $1
      ORDER BY q."order" ASC`,
    [toDbExamId(examId)]
  );

  return result.rows.map(toApiStudentQuestion);
};

module.exports = {
  getPublishedExams,
  getPublishedExamById,
  getExamStatusById,
  getPublishedExamQuestions,
  getReviewableQuestionsByExamId,
};
