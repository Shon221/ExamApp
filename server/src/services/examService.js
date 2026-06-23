// src/services/examService.js
// Business logic for exam operations.
// Controllers call these functions instead of directly touching mockData.
// This separation makes it easier to swap mock data for a real database later.

const mockData = require('../data/mockData');
const { generateId } = require('./idGenerator');

/**
 * Get all exams belonging to a specific lecturer.
 * @param {string} lecturerId
 * @returns {Array} Array of exam objects
 */
const getExamsByLecturer = (lecturerId) => {
  return mockData.exams.filter((exam) => exam.lecturer_id === lecturerId);
};

/**
 * Get a single exam by its ID.
 * @param {string} examId
 * @returns {object|undefined} The exam object or undefined if not found
 */
const getExamById = (examId) => {
  return mockData.exams.find((exam) => exam.id === examId);
};

/**
 * Get all published exams (for student portal).
 * @returns {Array} Array of published exam objects
 */
const getPublishedExams = () => {
  return mockData.exams.filter((exam) => exam.status === 'published');
};

/**
 * Create a new exam.
 * @param {object} examData - { title, instructions, duration_minutes, passing_score }
 * @param {string} lecturerId - The authenticated lecturer's ID
 * @returns {object} The newly created exam
 */
const createExam = (examData, lecturerId) => {
  const newExam = {
    id: generateId(),
    title: examData.title,
    instructions: examData.instructions || '',
    lecturer_id: lecturerId,
    status: 'draft',                // New exams always start as draft
    duration_minutes: examData.duration_minutes,
    passing_score: examData.passing_score,
    questions: [],                  // No questions yet
    created_at: new Date(),
    updated_at: new Date(),
  };

  mockData.exams.push(newExam);
  return newExam;
};

/**
 * Update an existing exam.
 * @param {string} examId - The exam's ID
 * @param {object} updates - Fields to update
 * @returns {object} The updated exam
 */
const updateExam = (examId, updates) => {
  const examIndex = mockData.exams.findIndex((exam) => exam.id === examId);

  // Merge the updates into the existing exam
  mockData.exams[examIndex] = {
    ...mockData.exams[examIndex],
    title: updates.title,
    instructions: updates.instructions ?? mockData.exams[examIndex].instructions,
    duration_minutes: updates.duration_minutes,
    passing_score: updates.passing_score,
    updated_at: new Date(),
  };

  return mockData.exams[examIndex];
};

/**
 * Update an exam's status.
 * @param {string} examId
 * @param {string} status - 'draft' | 'published' | 'archived'
 * @returns {object} The updated exam
 */
const updateExamStatus = (examId, status) => {
  const examIndex = mockData.exams.findIndex((exam) => exam.id === examId);
  mockData.exams[examIndex].status = status;
  mockData.exams[examIndex].updated_at = new Date();
  return mockData.exams[examIndex];
};

/**
 * Delete an exam and all related questions and submissions.
 * @param {string} examId
 */
const deleteExam = (examId) => {
  // Remove the exam
  mockData.exams = mockData.exams.filter((exam) => exam.id !== examId);

  // Remove all questions that belong to this exam
  mockData.questions = mockData.questions.filter((q) => q.exam_id !== examId);

  // Remove all submissions for this exam
  mockData.submissions = mockData.submissions.filter((s) => s.exam_id !== examId);
};

module.exports = {
  getExamsByLecturer,
  getExamById,
  getPublishedExams,
  createExam,
  updateExam,
  updateExamStatus,
  deleteExam,
};
