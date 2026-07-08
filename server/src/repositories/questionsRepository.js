// src/repositories/questionsRepository.js
// PostgreSQL data access for question routes.

const pool = require('../db');
const { toDbExamId, toApiExamId, toDbQuestionId, toApiQuestionId } = require('./examsRepository');

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

const selectQuestionColumns = `
  SELECT q.id,
         q.type,
         q.text,
         q.options,
         q.correct_answer,
         q."order",
         q.points,
         q.created_at,
         q.exam_id
    FROM questions q
`;

const getQuestionsByExam = async (examId) => {
  const result = await pool.query(
    `${selectQuestionColumns}
      WHERE q.exam_id = $1
      ORDER BY q."order" ASC`,
    [toDbExamId(examId)]
  );

  return result.rows.map(toApiQuestion);
};

const getQuestionById = async (examId, questionId) => {
  const result = await pool.query(
    `${selectQuestionColumns}
      WHERE q.exam_id = $1 AND q.id = $2`,
    [toDbExamId(examId), toDbQuestionId(questionId)]
  );

  return toApiQuestion(result.rows[0]);
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
  toDbQuestionId,
  toApiQuestionId,
  getQuestionsByExam,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
