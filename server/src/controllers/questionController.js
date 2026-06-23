// src/controllers/questionController.js
// Handles questions CRUD for lecturers.
// Questions are nested under exams: /api/exams/:examId/questions
// A lecturer can only manage questions for their own exams.

const mockData = require('../data/mockData');
const examService = require('../services/examService');
const { generateId } = require('../services/idGenerator');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * POST /api/exams/:examId/questions
 * Add a new question to an exam.
 */
const createQuestion = (req, res, next) => {
  try {
    const { examId } = req.params;

    // Find the exam
    const exam = examService.getExamById(examId);
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

    // Build the new question
    const newQuestion = {
      id: generateId(),
      exam_id: examId,
      type: req.body.type,
      text: req.body.text,
      options: req.body.options || [],
      correct_answer: req.body.correct_answer,
      order: req.body.order,
      points: req.body.points,
    };

    // Save question to mock data
    mockData.questions.push(newQuestion);

    // Add the question ID to the exam's questions array
    const examIndex = mockData.exams.findIndex((e) => e.id === examId);
    mockData.exams[examIndex].questions.push(newQuestion.id);
    mockData.exams[examIndex].updated_at = new Date();

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
const getQuestions = (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view questions for this exam.',
      });
    }

    // Get all questions that belong to this exam, sorted by order
    const questions = mockData.questions
      .filter((q) => q.exam_id === examId)
      .sort((a, b) => a.order - b.order);

    return responseHandler.success(res, { questions });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/exams/:examId/questions/:questionId
 * Update a specific question.
 */
const updateQuestion = (req, res, next) => {
  try {
    const { examId, questionId } = req.params;

    const exam = examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update questions for this exam.',
      });
    }

    // Find the question
    const questionIndex = mockData.questions.findIndex(
      (q) => q.id === questionId && q.exam_id === examId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this exam.',
      });
    }

    // Update the question (merge existing data with updates)
    mockData.questions[questionIndex] = {
      ...mockData.questions[questionIndex],
      type: req.body.type,
      text: req.body.text,
      options: req.body.options || mockData.questions[questionIndex].options,
      correct_answer: req.body.correct_answer,
      order: req.body.order,
      points: req.body.points,
    };

    logger.success(`Question updated in exam "${exam.title}" by ${req.user.email}`);

    return responseHandler.success(res, {
      question: mockData.questions[questionIndex],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/exams/:examId/questions/:questionId
 * Remove a question from an exam.
 */
const deleteQuestion = (req, res, next) => {
  try {
    const { examId, questionId } = req.params;

    const exam = examService.getExamById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (exam.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete questions from this exam.',
      });
    }

    // Check the question exists in this exam
    const questionExists = mockData.questions.some(
      (q) => q.id === questionId && q.exam_id === examId
    );
    if (!questionExists) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this exam.',
      });
    }

    // Remove from mockData.questions
    mockData.questions = mockData.questions.filter((q) => q.id !== questionId);

    // Remove from exam's questions array
    const examIndex = mockData.exams.findIndex((e) => e.id === examId);
    mockData.exams[examIndex].questions = mockData.exams[examIndex].questions.filter(
      (qId) => qId !== questionId
    );
    mockData.exams[examIndex].updated_at = new Date();

    logger.success(`Question deleted from exam "${exam.title}" by ${req.user.email}`);

    return responseHandler.successMessage(res, 'Question deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuestion, getQuestions, updateQuestion, deleteQuestion };
