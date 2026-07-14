// src/middleware/validation.js
// Joi validation schemas and a reusable validation middleware factory.
//
// How it works:
//   1. You define a Joi schema describing what the request body should look like
//   2. You call validate(schema) to create a middleware function
//   3. That middleware runs before your controller and checks the body
//   4. If validation fails → returns 400 Bad Request with the error message
//   5. If validation passes → calls next() to continue to the controller

const Joi = require('joi');
const xss = require('xss');

// ─── Schemas ──────────────────────────────────────────────────────────────────

/**
 * Schema for POST /api/auth/register
 */
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('lecturer', 'student').required().messages({
    'any.only': 'Role must be either "lecturer" or "student"',
    'any.required': 'Role is required',
  }),
});

/**
 * Schema for POST /api/auth/login
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

/**
 * Schema for POST /api/auth/refresh-token
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

/**
 * Schema for POST /api/exams (create exam)
 * and PUT /api/exams/:id (update exam)
 */
const examSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title is required',
    'any.required': 'Title is required',
  }),
  instructions: Joi.string().max(2000).optional().allow(''),
  duration_minutes: Joi.number().integer().min(1).max(300).required().messages({
    'number.base': 'Duration must be a number',
    'any.required': 'Duration in minutes is required',
  }),
  passing_score: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Passing score must be a number between 0 and 100',
    'any.required': 'Passing score is required',
  }),
});

/**
 * Schema for PATCH /api/exams/:id/status
 */
const examStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'published', 'archived').required().messages({
    'any.only': 'Status must be one of: draft, published, archived',
    'any.required': 'Status is required',
  }),
});

/**
 * Schema for POST /api/exams/:examId/questions (create question)
 * and PUT /api/exams/:examId/questions/:questionId (update question)
 */
const questionSchema = Joi.object({
  type: Joi.string().valid('multiple-choice', 'true-false', 'short-answer').required().messages({
    'any.only': 'Type must be one of: multiple-choice, true-false, short-answer',
    'any.required': 'Question type is required',
  }),
  text: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Question text is required',
    'string.min': 'Question text is required',
    'any.required': 'Question text is required',
  }),
  options: Joi.when('type', {
    is: 'multiple-choice',
    then: Joi.array()
      .items(Joi.string().trim().min(1).messages({ 'string.min': 'Options must not be blank' }))
      .min(2)
      .required()
      .messages({
        'array.min': 'Multiple-choice questions must have at least 2 non-empty options',
        'any.required': 'Options are required for multiple-choice questions',
      }),
    otherwise: Joi.array().items(Joi.string()).optional(),
  }),
  correct_answer: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Correct answer is required',
    'string.min': 'Correct answer must not be blank',
    'any.required': 'Correct answer is required',
  }),
  order: Joi.number().integer().min(1).required().messages({
    'any.required': 'Question order is required',
  }),
  points: Joi.number().min(1).max(100).required().messages({
    'any.required': 'Points value is required',
  }),
}).custom((value, helpers) => {
  // For multiple-choice: correct_answer must be one of the provided options
  if (value.type === 'multiple-choice' && value.options && value.correct_answer) {
    const cleanOptions = value.options.map((o) => o.trim());
    if (!cleanOptions.includes(value.correct_answer.trim())) {
      return helpers.error('any.invalid', {
        message: `Correct answer must match one of the provided options: ${cleanOptions.join(', ')}`,
      });
    }
  }
  // For true-false: correct_answer must be 'true' or 'false'
  if (value.type === 'true-false') {
    const normalized = value.correct_answer?.trim().toLowerCase();
    if (normalized !== 'true' && normalized !== 'false') {
      return helpers.error('any.invalid', {
        message: 'Correct answer for true/false questions must be "true" or "false"',
      });
    }
  }
  return value;
}).messages({
  'any.invalid': '{{#message}}',
});

/**
 * Schema for POST /api/student/submissions
 */
const submissionSchema = Joi.object({
  exam_id: Joi.string().required().messages({
    'any.required': 'Exam ID is required',
  }),
  answers: Joi.array().items(
    Joi.object({
      question_id: Joi.string().required(),
      answer: Joi.string().required().allow(''),
    })
  ).min(1).required().messages({
    'any.required': 'Answers are required',
    'array.min': 'At least one answer is required',
  }),
  time_spent_minutes: Joi.number().min(0).optional(),
});

/**
 * Schema for PUT /api/student/exams/:id/draft
 */
const draftSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      question_id: Joi.string().required(),
      answer: Joi.string().required().allow(''),
    })
  ).required().messages({
    'any.required': 'Answers are required',
  })
});

// ─── Validation Middleware Factory ────────────────────────────────────────────

/**
 * Creates a validation middleware using the given Joi schema.
 * Usage in routes: router.post('/path', validate(registerSchema), controller)
 *
 * @param {Joi.Schema} schema - The Joi schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    // abortEarly: false → collect ALL errors, not just the first one
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Collect all error messages into one string
      const errorMessage = error.details.map((d) => d.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    // Sanitize string values to prevent stored XSS
    const sanitizeObj = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && key !== 'password') {
          obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObj(obj[key]);
        }
      }
    };
    sanitizeObj(value);

    // Replace req.body with the validated (and possibly sanitized) value
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    refreshToken: refreshTokenSchema,
    exam: examSchema,
    examStatus: examStatusSchema,
    question: questionSchema,
    submission: submissionSchema,
    draft: draftSchema,
  },
};
