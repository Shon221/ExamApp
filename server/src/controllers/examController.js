// src/controllers/examController.js
// Handles all exam management HTTP requests for the lecturer.
// Lecturers can create, read, update, delete, and change exam status.

const examsRepository = require('../repositories/examsRepository');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * POST /api/exams
 * Create a new exam. Only lecturers can do this.
 */
const createExam = async (req, res, next) => {
  try {
    const newExam = await examsRepository.createExam(req.body, req.user.id);

    logger.success(`Exam created: "${newExam.title}" by lecturer ${req.user.email}`);

    return responseHandler.created(res, { exam: newExam });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exams
 * Get all exams belonging to the authenticated lecturer.
 */
const getMyExams = async (req, res, next) => {
  try {
    const exams = await examsRepository.getExamsByLecturer(req.user.id);
    return responseHandler.success(res, { exams });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exams/:id
 * Get a single exam by ID. Must belong to the authenticated lecturer.
 */
const getExamById = async (req, res, next) => {
  try {
    const exam = await examsRepository.getExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Security: Lecturer can only view their own exams
    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this exam.',
      });
    }

    return responseHandler.success(res, { exam });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/exams/:id
 * Update an exam. Must belong to the authenticated lecturer.
 */
const updateExam = async (req, res, next) => {
  try {
    const exam = await examsRepository.getExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this exam.',
      });
    }

    const updatedExam = await examsRepository.updateExam(req.params.id, req.body);

    logger.success(`Exam updated: "${updatedExam.title}" by lecturer ${req.user.email}`);

    return responseHandler.success(res, { exam: updatedExam });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/exams/:id
 * Delete an exam and all related questions and submissions.
 * Must belong to the authenticated lecturer.
 */
const deleteExam = async (req, res, next) => {
  try {
    const exam = await examsRepository.getExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this exam.',
      });
    }

    await examsRepository.deleteExam(req.params.id);

    logger.success(`Exam deleted: "${exam.title}" by lecturer ${req.user.email}`);

    return responseHandler.successMessage(res, 'Exam deleted successfully (including all related questions and submissions).');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/exams/:id/status
 * Change the status of an exam (draft → published → archived).
 */
const updateExamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const exam = await examsRepository.getExamById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this exam.',
      });
    }

    const updatedExam = await examsRepository.updateExamStatus(req.params.id, status);

    logger.success(`Exam status changed: "${exam.title}" → "${status}" by ${req.user.email}`);

    return responseHandler.success(res, { exam: updatedExam });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getMyExams,
  getExamById,
  updateExam,
  deleteExam,
  updateExamStatus,
};
