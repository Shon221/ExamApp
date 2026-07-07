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

/**
 * PATCH /api/lecturer/submissions/:id/grade
 * Manually grade a specific question in a submission.
 */
const gradeAnswer = (req, res, next) => {
  try {
    const { question_id, points_earned, feedback } = req.body;
    
    if (!question_id || points_earned === undefined) {
      return res.status(400).json({ success: false, message: 'Missing question_id or points_earned.' });
    }

    const updatedSubmission = submissionService.gradeAnswer(
      req.params.id,
      question_id,
      points_earned,
      feedback || '',
      req.user.id
    );

    if (!updatedSubmission) {
      return res.status(404).json({ success: false, message: 'Submission or answer not found, or not authorized.' });
    }

    return responseHandler.success(res, { submission: updatedSubmission });
  } catch (error) {
    if (error.message === 'Not authorized to grade this submission') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { getAllSubmissions, getSubmissionsByExam, getSubmissionById, gradeAnswer };
