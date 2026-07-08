// src/routes/auth.js
// Defines all authentication endpoints.
// Routes are mapped to controller functions through middleware chains.

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts, please try again later' },
});

// POST /api/auth/register
// Public — anyone can register
router.post(
  '/register',
  authLimiter,
  validate(schemas.register),  // 1. Validate the body
  authController.register       // 2. Process the registration
);

// POST /api/auth/login
// Public — anyone can log in
router.post(
  '/login',
  authLimiter,
  validate(schemas.login),     // 1. Validate the body
  authController.login          // 2. Process the login
);

// POST /api/auth/logout
// Public — no auth required (token might already be expired)
router.post(
  '/logout',
  authController.logout
);

// POST /api/auth/refresh-token
// Public — used to get a new access token using a refresh token
router.post(
  '/refresh-token',
  authController.refreshToken        // 2. Issue new access token
);

// GET /api/auth/me
// Protected — requires a valid JWT token
router.get(
  '/me',
  authenticate,          // 1. Verify the JWT and set req.user
  authController.getMe   // 2. Return current user profile
);

module.exports = router;
