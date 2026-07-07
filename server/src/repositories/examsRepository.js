// src/repositories/examsRepository.js
// PostgreSQL data access for exam and question routes.

const pool = require('../db');

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

const LEGACY_QUESTION_IDS = {
  q1: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  q2: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  q3: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
};

const LEGACY_QUESTION_UUIDS = Object.entries(LEGACY_QUESTION_IDS).reduce((acc, [legacyId, uuid]) => {
  acc[uuid] = legacyId;
  return acc;
}, {});

const toDbUserId = (userId) => LEGACY_USER_IDS[userId] || userId;
const toDbExamId = (examId) => LEGACY_EXAM_IDS[examId] || examId;
const toDbQuestionId = (questionId) => LEGACY_QUESTION_IDS[questionId] || questionId;
const toApiUserId = (userId) => LEGACY_USER_UUIDS[userId] || userId;
const toApiExamId = (examId) => LEGACY_EXAM_UUIDS[examId] || examId;
const toApiQuestionId = (questionId) => LEGACY_QUESTION_UUIDS[questionId] || questionId;

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
    questions: row.question_ids ? row.question_ids.map(toApiQuestionId) : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const toApiQuestion = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: toApiQuestionId(row.id),
    exam_id: toApiExamId(row.exam_id),
    type: row.type,
    text: row.text,
    options: row.options || [],
    correct_answer: row.correct_answer,
    order: row.order,
    points: row.points,
    created_at: row.created_at,
  };
};

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

const getExamsByLecturer = async (lecturerId) => {
  const result = await pool.query(
    `${examSelect}
      WHERE e.lecturer_id = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
    [toDbUserId(lecturerId)]
  );

  return result.rows.map(toApiExam);
};

const getExamById = async (examId) => {
  const result = await pool.query(
    `${examSelect}
      WHERE e.id = $1
      GROUP BY e.id`,
    [toDbExamId(examId)]
  );

  return toApiExam(result.rows[0]);
};

const getPublishedExams = async () => {
  const result = await pool.query(
    `${examSelect}
      WHERE e.status = 'published'
      GROUP BY e.id
      ORDER BY e.created_at DESC`
  );

  return result.rows.map(toApiExam);
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

const getQuestionsByExam = async (examId) => {
  const result = await pool.query(
    `SELECT id, exam_id, type, text, options, correct_answer, "order", points, created_at
       FROM questions
      WHERE exam_id = $1
      ORDER BY "order" ASC`,
    [toDbExamId(examId)]
  );

  return result.rows.map(toApiQuestion);
};

const createQuestion = async (examId, questionData) => {
  const result = await pool.query(
    `INSERT INTO questions (exam_id, type, text, options, correct_answer, "order", points)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, exam_id, type, text, options, correct_answer, "order", points, created_at`,
    [
      toDbExamId(examId),
      questionData.type,
      questionData.text,
      questionData.options || [],
      questionData.correct_answer,
      questionData.order,
      questionData.points,
    ]
  );

  return toApiQuestion(result.rows[0]);
};

const updateQuestion = async (examId, questionId, updates) => {
  const result = await pool.query(
    `UPDATE questions
        SET type = $3,
            text = $4,
            options = $5,
            correct_answer = $6,
            "order" = $7,
            points = $8
      WHERE exam_id = $1 AND id = $2
      RETURNING id, exam_id, type, text, options, correct_answer, "order", points, created_at`,
    [
      toDbExamId(examId),
      toDbQuestionId(questionId),
      updates.type,
      updates.text,
      updates.options || [],
      updates.correct_answer,
      updates.order,
      updates.points,
    ]
  );

  return toApiQuestion(result.rows[0]);
};

const deleteQuestion = async (examId, questionId) => {
  const result = await pool.query(
    'DELETE FROM questions WHERE exam_id = $1 AND id = $2 RETURNING id',
    [toDbExamId(examId), toDbQuestionId(questionId)]
  );

  return result.rowCount > 0;
};

module.exports = {
  LEGACY_USER_IDS,
  LEGACY_EXAM_IDS,
  LEGACY_QUESTION_IDS,
  toDbUserId,
  toDbExamId,
  toDbQuestionId,
  getExamsByLecturer,
  getExamById,
  getPublishedExams,
  createExam,
  updateExam,
  deleteExam,
  updateExamStatus,
  getQuestionsByExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
