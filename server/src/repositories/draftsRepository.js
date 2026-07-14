// src/repositories/draftsRepository.js
// PostgreSQL data access for student exam drafts.

const pool = require('../db');
const {
  LEGACY_USER_IDS,
  LEGACY_EXAM_IDS,
  toDbUserId,
  toDbExamId,
} = require('./examsRepository');

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

const toApiDraft = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    student_id: toApiUserId(row.student_id),
    exam_id: toApiExamId(row.exam_id),
    answers: row.answers || [],
    updated_at: row.updated_at,
  };
};

const getDraft = async (studentId, examId) => {
  const result = await pool.query(
    `SELECT id, student_id, exam_id, answers, updated_at
       FROM drafts
      WHERE student_id = $1 AND exam_id = $2`,
    [toDbUserId(studentId), toDbExamId(examId)]
  );

  return toApiDraft(result.rows[0]);
};



const saveDraft = async (studentId, examId, answers) => {
  const result = await pool.query(
    `INSERT INTO drafts (student_id, exam_id, answers, updated_at)
     VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (student_id, exam_id) DO UPDATE
       SET answers = EXCLUDED.answers,
           updated_at = CURRENT_TIMESTAMP
     RETURNING id, student_id, exam_id, answers, updated_at`,
    [toDbUserId(studentId), toDbExamId(examId), JSON.stringify(answers || [])]
  );

  return toApiDraft(result.rows[0]);
};

const deleteDraft = async (studentId, examId) => {
  const result = await pool.query(
    'DELETE FROM drafts WHERE student_id = $1 AND exam_id = $2',
    [toDbUserId(studentId), toDbExamId(examId)]
  );

  return result.rowCount > 0;
};

module.exports = {
  getDraft,

  saveDraft,
  deleteDraft,
};
