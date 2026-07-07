// src/repositories/submissionsRepository.js
// PostgreSQL data access for student submissions.

const pool = require('../db');
const {
  LEGACY_USER_IDS,
  LEGACY_EXAM_IDS,
  toDbUserId,
  toDbExamId,
  toDbQuestionId,
  toApiExamId,
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
const toDbAnswerQuestionId = (questionId) => toDbQuestionId(questionId);
const toApiAnswerExamId = (examId) => LEGACY_EXAM_UUIDS[examId] || toApiExamId(examId);
const isUuid = (id) => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(id)
);

const toApiAnswer = (row) => {
  const answer = {
    question_id: toApiQuestionId(row.question_id),
    answer: row.answer || '',
    is_correct: row.is_correct,
    points_earned: row.points_earned,
  };

  if (row.feedback) {
    answer.feedback = row.feedback;
  }
  if (row.graded_by) {
    answer.graded_by = toApiUserId(row.graded_by);
  }
  if (row.graded_at) {
    answer.graded_at = row.graded_at;
  }

  return answer;
};

const toApiSubmission = (row, answers = []) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    exam_id: toApiAnswerExamId(row.exam_id),
    student_id: toApiUserId(row.student_id),
    answers,
    score: row.score,
    total_points_earned: row.total_points_earned,
    total_possible_points: row.total_possible_points,
    status: row.status,
    submitted_at: row.submitted_at,
    time_spent_minutes: row.time_spent_minutes,
  };
};

const getQuestionsForScoring = async (client, examId) => {
  const result = await client.query(
    `SELECT id, correct_answer, points
       FROM questions
      WHERE exam_id = $1
      ORDER BY "order" ASC`,
    [toDbExamId(examId)]
  );

  return result.rows;
};

const getAnswersBySubmissionIds = async (submissionIds) => {
  if (submissionIds.length === 0) {
    return new Map();
  }

  const result = await pool.query(
    `SELECT sa.submission_id, sa.question_id, sa.answer, sa.is_correct, sa.points_earned,
            sa.feedback, sa.graded_by, sa.graded_at
       FROM submission_answers sa
       INNER JOIN questions q ON q.id = sa.question_id
      WHERE sa.submission_id = ANY($1::uuid[])
      ORDER BY sa.submission_id ASC, q."order" ASC`,
    [submissionIds]
  );

  return result.rows.reduce((acc, row) => {
    if (!acc.has(row.submission_id)) {
      acc.set(row.submission_id, []);
    }
    acc.get(row.submission_id).push(toApiAnswer(row));
    return acc;
  }, new Map());
};

const getSubmissionById = async (submissionId) => {
  if (!isUuid(submissionId)) {
    return null;
  }

  const submissionResult = await pool.query(
    `SELECT id, exam_id, student_id, score, total_points_earned,
            total_possible_points, status, submitted_at, time_spent_minutes
       FROM submissions
      WHERE id = $1`,
    [submissionId]
  );

  const submission = submissionResult.rows[0];
  if (!submission) {
    return null;
  }

  const answersBySubmissionId = await getAnswersBySubmissionIds([submission.id]);
  return toApiSubmission(submission, answersBySubmissionId.get(submission.id) || []);
};

const getSubmissionsByStudent = async (studentId) => {
  const result = await pool.query(
    `SELECT id, exam_id, student_id, score, total_points_earned,
            total_possible_points, status, submitted_at, time_spent_minutes
       FROM submissions
      WHERE student_id = $1
      ORDER BY submitted_at DESC`,
    [toDbUserId(studentId)]
  );

  const answersBySubmissionId = await getAnswersBySubmissionIds(result.rows.map((row) => row.id));
  return result.rows.map((row) => toApiSubmission(row, answersBySubmissionId.get(row.id) || []));
};

const getSubmissionByStudentAndExam = async (studentId, examId) => {
  const result = await pool.query(
    `SELECT id, exam_id, student_id, score, total_points_earned,
            total_possible_points, status, submitted_at, time_spent_minutes
       FROM submissions
      WHERE student_id = $1 AND exam_id = $2
      ORDER BY submitted_at DESC
      LIMIT 1`,
    [toDbUserId(studentId), toDbExamId(examId)]
  );

  const submission = result.rows[0];
  if (!submission) {
    return null;
  }

  const answersBySubmissionId = await getAnswersBySubmissionIds([submission.id]);
  return toApiSubmission(submission, answersBySubmissionId.get(submission.id) || []);
};

const hasStudentSubmitted = async (studentId, examId) => {
  const result = await pool.query(
    `SELECT 1
       FROM submissions
      WHERE student_id = $1 AND exam_id = $2
      LIMIT 1`,
    [toDbUserId(studentId), toDbExamId(examId)]
  );

  return result.rowCount > 0;
};

const createSubmission = async (examId, studentId, answers, timeSpentMinutes = 0) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const examQuestions = await getQuestionsForScoring(client, examId);
    const questionById = new Map(
      examQuestions.map((question) => [question.id, question])
    );

    const totalPossiblePoints = examQuestions.reduce((sum, question) => sum + question.points, 0);
    let totalPointsEarned = 0;

    const gradedAnswers = answers.map((answer) => {
      const dbQuestionId = toDbAnswerQuestionId(answer.question_id);
      const question = questionById.get(dbQuestionId);

      if (!question) {
        const error = new Error('Question not found for this exam.');
        error.statusCode = 400;
        throw error;
      }

      const isCorrect =
        answer.answer.toString().trim().toLowerCase() ===
        question.correct_answer.toString().trim().toLowerCase();
      const pointsEarned = isCorrect ? question.points : 0;
      totalPointsEarned += pointsEarned;

      return {
        question_id: dbQuestionId,
        answer: answer.answer,
        is_correct: isCorrect,
        points_earned: pointsEarned,
      };
    });

    const score =
      totalPossiblePoints > 0
        ? Math.round((totalPointsEarned / totalPossiblePoints) * 100)
        : 0;

    const submissionResult = await client.query(
      `INSERT INTO submissions (
         exam_id, student_id, score, total_points_earned, total_possible_points,
         status, time_spent_minutes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, exam_id, student_id, score, total_points_earned,
                 total_possible_points, status, submitted_at, time_spent_minutes`,
      [
        toDbExamId(examId),
        toDbUserId(studentId),
        score,
        totalPointsEarned,
        totalPossiblePoints,
        'graded',
        timeSpentMinutes,
      ]
    );

    const submission = submissionResult.rows[0];
    const insertedAnswers = [];

    for (const gradedAnswer of gradedAnswers) {
      const answerResult = await client.query(
        `INSERT INTO submission_answers (
           submission_id, question_id, answer, is_correct, points_earned
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING question_id, answer, is_correct, points_earned,
                   feedback, graded_by, graded_at`,
        [
          submission.id,
          gradedAnswer.question_id,
          gradedAnswer.answer,
          gradedAnswer.is_correct,
          gradedAnswer.points_earned,
        ]
      );
      insertedAnswers.push(toApiAnswer(answerResult.rows[0]));
    }

    await client.query('COMMIT');

    return toApiSubmission(submission, insertedAnswers);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createSubmission,
  getSubmissionsByStudent,
  getSubmissionById,
  getSubmissionByStudentAndExam,
  hasStudentSubmitted,
};
