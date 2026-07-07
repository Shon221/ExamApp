// src/controllers/studentController.js
// Handles the student portal:
//   - Browsing published exams
//   - Viewing exam details (without correct answers)
//   - Submitting an exam
//   - Viewing their own submissions

const examService = require('../services/examService');
const studentExamsRepository = require('../repositories/studentExamsRepository');
const draftsRepository = require('../repositories/draftsRepository');
const submissionService = require('../services/submissionService');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * GET /api/student/exams
 * Return all published exams for students to browse.
 * Correct answers are NEVER included.
 */
const getPublishedExams = async (req, res, next) => {
  try {
    const exams = await studentExamsRepository.getPublishedExams();
    return responseHandler.success(res, { exams });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/exams/:id
 * Return a single published exam with its questions.
 * Correct answers are STRIPPED OUT before sending.
 */
const getExamForStudent = async (req, res, next) => {
  try {
    const exam = await studentExamsRepository.getPublishedExamById(req.params.id);

    if (!exam) {
      const examStatus = await studentExamsRepository.getExamStatusById(req.params.id);
      if (examStatus && examStatus !== 'published') {
        return res.status(403).json({
          success: false,
          message: 'This exam is not available.',
        });
      }

      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const questions = await studentExamsRepository.getPublishedExamQuestions(exam.id);

    return responseHandler.success(res, {
      exam: {
        ...exam,
        questions, // Replace IDs with full question objects (without answers)
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/student/submissions
 * Submit an exam. The server will grade it automatically.
 */
const submitExam = async (req, res, next) => {
  try {
    const { exam_id, answers, time_spent_minutes } = req.body;

    // Verify the exam exists
    const exam = await examService.getExamById(exam_id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Verify the exam is published
    if (exam.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'You can only submit published exams.',
      });
    }

    // Check if student already submitted this exam
    if (submissionService.hasStudentSubmitted(req.user.id, exam_id)) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted this exam.',
      });
    }

    // Grade the submission and save it
    const submission = await submissionService.createSubmission(
      exam_id,
      req.user.id,
      answers,
      time_spent_minutes || 0
    );

    // Delete any saved draft now that it's submitted
    await draftsRepository.deleteDraft(req.user.id, exam_id);

    logger.success(
      `Submission created: student ${req.user.email} submitted exam "${exam.title}" | Score: ${submission.score}%`
    );

    return responseHandler.created(res, { submission });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/submissions
 * Return all submissions made by the authenticated student.
 */
const getMySubmissions = (req, res, next) => {
  try {
    const submissions = submissionService.getSubmissionsByStudent(req.user.id);
    return responseHandler.success(res, { submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/submissions/:id
 * Return a specific submission. Must belong to the student.
 */
const getSubmissionById = (req, res, next) => {
  try {
    const submission = submissionService.getSubmissionById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Security: Students can only see their own submissions
    if (submission.student_id !== req.user.id) {
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
 * GET /api/student/exams/:id/draft
 * Get the saved draft for an exam.
 */
const getDraft = async (req, res, next) => {
  try {
    const draft = await draftsRepository.getDraft(req.user.id, req.params.id);
    if (!draft) {
      return responseHandler.success(res, { draft: null });
    }
    return responseHandler.success(res, { draft });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/student/exams/:id/draft
 * Save a draft for an exam.
 */
const saveDraft = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const draft = await draftsRepository.saveDraft(req.user.id, req.params.id, answers);
    return responseHandler.success(res, { draft });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedExams,
  getExamForStudent,
  submitExam,
  getMySubmissions,
  getSubmissionById,
  getDraft,
  saveDraft,
};
