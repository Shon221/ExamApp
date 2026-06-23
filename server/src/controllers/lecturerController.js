// src/controllers/lecturerController.js
// Handles the lecturer results dashboard:
//   - View all submissions for their exams
//   - View submissions for a specific exam
//   - View a specific submission (must belong to their exam)

const submissionService = require('../services/submissionService');
const examService = require('../services/examService');
const responseHandler = require('../utils/responseHandler');

/**
 * GET /api/lecturer/submissions
 * Return all submissions for all exams belonging to the lecturer.
 */
const getAllSubmissions = (req, res, next) => {
  try {
    const submissions = submissionService.getSubmissionsByLecturer(req.user.id);
    return responseHandler.success(res, { submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lecturer/exams/:examId/submissions
 * Return all submissions for a specific exam.
 * Exam must belong to the lecturer.
 */
const getSubmissionsByExam = (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Security: Lecturer can only view submissions for their own exams
    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view submissions for this exam.',
      });
    }

    const submissions = submissionService.getSubmissionsByExam(examId);
    return responseHandler.success(res, { submissions, exam: { id: exam.id, title: exam.title } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lecturer/submissions/:id
 * Return a specific submission.
 * The related exam must belong to the lecturer.
 */
const getSubmissionById = (req, res, next) => {
  try {
    const submission = submissionService.getSubmissionById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Find the exam and verify ownership
    const exam = examService.getExamById(submission.exam_id);
    if (!exam || exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this submission.',
      });
    }

    return responseHandler.success(res, { submission });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSubmissions, getSubmissionsByExam, getSubmissionById };
