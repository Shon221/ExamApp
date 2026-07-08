// src/services/submissionService.js
// Business logic facade for exam submissions.
// Submission persistence and grading are handled by PostgreSQL repositories.

const draftsRepository = require('../repositories/draftsRepository');
const submissionsRepository = require('../repositories/submissionsRepository');

/**
 * Grade and store an exam submission.
 *
 * @param {string} examId - The exam being submitted
 * @param {string} studentId - The student submitting
 * @param {Array} answers - Array of { question_id, answer }
 * @param {number} timeSpentMinutes - How long the student took
 * @returns {Promise<object>} The completed submission with scores
 */
const createSubmission = (examId, studentId, answers, timeSpentMinutes = 0) => {
  return submissionsRepository.createSubmission(examId, studentId, answers, timeSpentMinutes);
};

/**
 * Get all submissions for a specific student.
 * @param {string} studentId
 * @returns {Promise<Array>}
 */
const getSubmissionsByStudent = (studentId) => {
  return submissionsRepository.getSubmissionsByStudent(studentId);
};

/**
 * Get a single submission by ID.
 * @param {string} submissionId
 * @returns {Promise<object|null>}
 */
const getSubmissionById = (submissionId) => {
  return submissionsRepository.getSubmissionById(submissionId);
};

/**
 * Get all submissions for exams belonging to a lecturer.
 * @param {string} lecturerId
 * @returns {Promise<Array>}
 */
const getSubmissionsByLecturer = (lecturerId) => {
  return submissionsRepository.getSubmissionsByLecturer(lecturerId);
};

/**
 * Get all submissions for a specific exam.
 * @param {string} examId
 * @returns {Promise<Array>}
 */
const getSubmissionsByExam = (examId) => {
  return submissionsRepository.getSubmissionsByExam(examId);
};

/**
 * Check if a student already submitted a specific exam.
 * @param {string} studentId
 * @param {string} examId
 * @returns {Promise<boolean>}
 */
const hasStudentSubmitted = (studentId, examId) => {
  return submissionsRepository.hasStudentSubmitted(studentId, examId);
};



/**
 * Manually grade an answer.
 */
const gradeAnswer = (submissionId, questionId, pointsEarned, feedback, lecturerId) => {
  return submissionsRepository.gradeAnswer(
    submissionId,
    questionId,
    pointsEarned,
    feedback,
    lecturerId
  );
};

module.exports = {
  createSubmission,
  getSubmissionsByStudent,
  getSubmissionById,
  getSubmissionsByLecturer,
  getSubmissionsByExam,
  hasStudentSubmitted,

  gradeAnswer,
};
