// src/routes/questions.js
// Question management routes — nested under exams.
// Full paths will be: /api/exams/:examId/questions
// All routes require: authenticate + authorize('lecturer')

const express = require('express');
// mergeParams: true is IMPORTANT — it allows us to access req.params.examId
// which comes from the parent route (/api/exams/:examId/...)
const router = express.Router({ mergeParams: true });

const questionController = require('../controllers/questionController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const lecturerOnly = [authenticate, authorize('lecturer')];

// POST /api/exams/:examId/questions — Add a question to an exam
router.post(
  '/:examId/questions',
  ...lecturerOnly,
  validate(schemas.question),
  questionController.createQuestion
);

// GET /api/exams/:examId/questions — Get all questions for an exam
router.get(
  '/:examId/questions',
  ...lecturerOnly,
  questionController.getQuestions
);

// PUT /api/exams/:examId/questions/:questionId — Update a question
router.put(
  '/:examId/questions/:questionId',
  ...lecturerOnly,
  validate(schemas.question),
  questionController.updateQuestion
);

// DELETE /api/exams/:examId/questions/:questionId — Delete a question
router.delete(
  '/:examId/questions/:questionId',
  ...lecturerOnly,
  questionController.deleteQuestion
);

module.exports = router;
