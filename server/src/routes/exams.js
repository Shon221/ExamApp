// src/routes/exams.js
// Lecturer exam management routes.
// All routes here require: authenticate + authorize('lecturer')

const express = require('express');
const router = express.Router();

const examController = require('../controllers/examController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Apply authentication and lecturer role to ALL exam routes
const lecturerOnly = [authenticate, authorize('lecturer')];

// POST /api/exams — Create a new exam
router.post(
  '/',
  ...lecturerOnly,
  validate(schemas.exam),
  examController.createExam
);

// GET /api/exams — Get all exams for this lecturer
router.get(
  '/',
  ...lecturerOnly,
  examController.getMyExams
);

// GET /api/exams/:id — Get one exam by ID
router.get(
  '/:id',
  ...lecturerOnly,
  examController.getExamById
);

// PUT /api/exams/:id — Update exam fields
router.put(
  '/:id',
  ...lecturerOnly,
  validate(schemas.exam),
  examController.updateExam
);

// DELETE /api/exams/:id — Delete exam (and questions + submissions)
router.delete(
  '/:id',
  ...lecturerOnly,
  examController.deleteExam
);

// PATCH /api/exams/:id/status — Change exam status
router.patch(
  '/:id/status',
  ...lecturerOnly,
  validate(schemas.examStatus),
  examController.updateExamStatus
);

module.exports = router;
