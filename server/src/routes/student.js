// src/routes/student.js
// Student portal routes.
// All routes require: authenticate + authorize('student')

const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const studentOnly = [authenticate, authorize('student')];

// GET /api/student/exams — Browse all published exams
router.get('/exams', ...studentOnly, studentController.getPublishedExams);

// GET /api/student/exams/:id — View a single published exam (no correct answers)
router.get('/exams/:id', ...studentOnly, studentController.getExamForStudent);

// GET /api/student/exams/:id/draft — View a saved draft for an exam
router.get('/exams/:id/draft', ...studentOnly, studentController.getDraft);

// PUT /api/student/exams/:id/draft — Save a draft for an exam
router.put('/exams/:id/draft', ...studentOnly, studentController.saveDraft);

// POST /api/student/submissions — Submit an exam for grading
router.post(
  '/submissions',
  ...studentOnly,
  validate(schemas.submission),
  studentController.submitExam
);

// GET /api/student/submissions — View all of the student's submissions
router.get('/submissions', ...studentOnly, studentController.getMySubmissions);

// GET /api/student/submissions/:id — View a specific submission
router.get('/submissions/:id', ...studentOnly, studentController.getSubmissionById);

module.exports = router;
