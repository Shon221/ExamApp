// src/services/submissionService.js
// Business logic for grading and storing exam submissions.
// When a student submits an exam, this service:
//   1. Looks up the correct answers for each question
//   2. Compares the student's answer to the correct answer
//   3. Calculates points earned for each question
//   4. Calculates the final score as a percentage
//   5. Stores the graded submission in mockData

const mockData = require('../data/mockData');
const { generateId } = require('./idGenerator');

/**
 * Grade and store an exam submission.
 *
 * @param {string} examId - The exam being submitted
 * @param {string} studentId - The student submitting
 * @param {Array} answers - Array of { question_id, answer }
 * @param {number} timeSpentMinutes - How long the student took
 * @returns {object} The completed submission with scores
 */
const createSubmission = (examId, studentId, answers, timeSpentMinutes = 0) => {
  // Get all questions for this exam
  const examQuestions = mockData.questions.filter((q) => q.exam_id === examId);

  // Calculate total possible points for the exam
  const totalPossiblePoints = examQuestions.reduce((sum, q) => sum + q.points, 0);

  let totalPointsEarned = 0;

  // Grade each answer
  const gradedAnswers = answers.map((answer) => {
    // Find the corresponding question
    const question = examQuestions.find((q) => q.id === answer.question_id);

    if (!question) {
      // Question not found — count as incorrect
      return {
        question_id: answer.question_id,
        answer: answer.answer,
        is_correct: false,
        points_earned: 0,
      };
    }

    // Compare the student's answer to the correct answer (case-insensitive trim)
    const isCorrect =
      answer.answer.toString().trim().toLowerCase() ===
      question.correct_answer.toString().trim().toLowerCase();

    const pointsEarned = isCorrect ? question.points : 0;
    totalPointsEarned += pointsEarned;

    return {
      question_id: answer.question_id,
      answer: answer.answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
    };
  });

  // Calculate percentage score (0–100)
  const score =
    totalPossiblePoints > 0
      ? Math.round((totalPointsEarned / totalPossiblePoints) * 100)
      : 0;

  // Build the submission object
  const newSubmission = {
    id: generateId(),
    exam_id: examId,
    student_id: studentId,
    answers: gradedAnswers,
    score,
    total_points_earned: totalPointsEarned,
    total_possible_points: totalPossiblePoints,
    status: 'graded',
    submitted_at: new Date(),
    time_spent_minutes: timeSpentMinutes,
  };

  // Save to mock data
  mockData.submissions.push(newSubmission);

  return newSubmission;
};

/**
 * Get all submissions for a specific student.
 * @param {string} studentId
 * @returns {Array}
 */
const getSubmissionsByStudent = (studentId) => {
  return mockData.submissions.filter((s) => s.student_id === studentId);
};

/**
 * Get a single submission by ID.
 * @param {string} submissionId
 * @returns {object|undefined}
 */
const getSubmissionById = (submissionId) => {
  return mockData.submissions.find((s) => s.id === submissionId);
};

/**
 * Get all submissions for exams belonging to a lecturer.
 * @param {string} lecturerId
 * @returns {Array}
 */
const getSubmissionsByLecturer = (lecturerId) => {
  // First, get all exam IDs that belong to this lecturer
  const lecturerExamIds = mockData.exams
    .filter((exam) => exam.lecturer_id === lecturerId)
    .map((exam) => exam.id);

  // Then filter submissions to only those exams
  return mockData.submissions.filter((s) => lecturerExamIds.includes(s.exam_id));
};

/**
 * Get all submissions for a specific exam.
 * @param {string} examId
 * @returns {Array}
 */
const getSubmissionsByExam = (examId) => {
  return mockData.submissions.filter((s) => s.exam_id === examId);
};

/**
 * Check if a student already submitted a specific exam.
 * @param {string} studentId
 * @param {string} examId
 * @returns {boolean}
 */
const hasStudentSubmitted = (studentId, examId) => {
  return mockData.submissions.some(
    (s) => s.student_id === studentId && s.exam_id === examId
  );
};

module.exports = {
  createSubmission,
  getSubmissionsByStudent,
  getSubmissionById,
  getSubmissionsByLecturer,
  getSubmissionsByExam,
  hasStudentSubmitted,
};
