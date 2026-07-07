// src/controllers/questionController.js
// Handles questions CRUD for lecturers.
// Questions are nested under exams: /api/exams/:examId/questions
// A lecturer can only manage questions for their own exams.

const examService = require('../services/examService');
const examsRepository = require('../repositories/examsRepository');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * POST /api/exams/:examId/questions
 * Add a new question to an exam.
 */
const createQuestion = async (req, res, next) => {
  try {
    const { examId } = req.params;

    // Find the exam
    const exam = await examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Only the exam owner can add questions
    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add questions to this exam.',
      });
    }

    const newQuestion = await examsRepository.createQuestion(examId, req.body);

    logger.success(`Question added to exam "${exam.title}" by ${req.user.email}`);

    return responseHandler.created(res, { question: newQuestion });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/exams/:examId/questions
 * Get all questions for an exam. Only the exam owner can access.
 */
const getQuestions = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view questions for this exam.',
      });
    }

    const questions = await examsRepository.getQuestionsByExam(examId);

    return responseHandler.success(res, { questions });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/exams/:examId/questions/:questionId
 * Update a specific question.
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { examId, questionId } = req.params;

    const exam = await examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update questions for this exam.',
      });
    }

    const updatedQuestion = await examsRepository.updateQuestion(examId, questionId, req.body);

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this exam.',
      });
    }

    logger.success(`Question updated in exam "${exam.title}" by ${req.user.email}`);

    return responseHandler.success(res, {
      question: updatedQuestion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/exams/:examId/questions/:questionId
 * Remove a question from an exam.
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { examId, questionId } = req.params;

    const exam = await examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete questions from this exam.',
      });
    }

    const questionDeleted = await examsRepository.deleteQuestion(examId, questionId);
    if (!questionDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this exam.',
      });
    }

    logger.success(`Question deleted from exam "${exam.title}" by ${req.user.email}`);

    return responseHandler.successMessage(res, 'Question deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuestion, getQuestions, updateQuestion, deleteQuestion };
