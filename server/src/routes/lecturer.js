// src/routes/lecturer.js
// Lecturer results dashboard routes.
// All routes require: authenticate + authorize('lecturer')

const express = require('express');
const router = express.Router();

const lecturerController = require('../controllers/lecturerController');
const { authenticate, authorize } = require('../middleware/auth');

const lecturerOnly = [authenticate, authorize('lecturer')];

// GET /api/lecturer/submissions
// Return all submissions for all exams belonging to this lecturer
router.get('/submissions', ...lecturerOnly, lecturerController.getAllSubmissions);

// GET /api/lecturer/exams/:examId/submissions
// Return submissions for a specific exam (must belong to the lecturer)
router.get(
  '/exams/:examId/submissions',
  ...lecturerOnly,
  lecturerController.getSubmissionsByExam
);

// GET /api/lecturer/submissions/:id
// Return a specific submission (related exam must belong to the lecturer)
router.get('/submissions/:id', ...lecturerOnly, lecturerController.getSubmissionById);

module.exports = router;
