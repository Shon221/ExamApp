// src/controllers/authController.js
// Handles all authentication HTTP requests.
// Each function here corresponds to one API endpoint.
// Controllers are kept thin — they validate, call services, and return responses.

const authService = require('../services/authService');
const authRepository = require('../repositories/authRepository');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Create a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const existingUser = await authRepository.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash the password before saving
    const hashedPassword = await authService.hashPassword(password);

    // Create the new user
    const newUser = await authRepository.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    // Generate access token
    const accessToken = authService.generateAccessToken(newUser);

    // Log the event
    logger.auth(`User registered: ${email} (${role})`);

    // Return user data (without password) and token
    return responseHandler.created(res, {
      user: authService.sanitizeUser(newUser),
      accessToken,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }
    next(error); // Pass to error handler
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return tokens.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (case-insensitive)
    const user = await authRepository.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await authService.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate both tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = await authService.generateRefreshToken(user);

    logger.auth(`User logged in: ${email}`);

    return responseHandler.success(res, {
      user: authService.sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Revoke the refresh token and return success.
 * The frontend is responsible for removing the access token from storage.
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // If a refresh token was provided, revoke it
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    logger.auth(`User logged out${req.user ? `: ${req.user.email}` : ''}`);

    return responseHandler.successMessage(res, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 * Use a refresh token to get a new access token.
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    // Verify the refresh token
    const result = await authService.verifyRefreshToken(token);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    // Find the user
    const user = await authRepository.getUserById(result.decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Generate a new access token
    const newAccessToken = authService.generateAccessToken(user);

    return responseHandler.success(res, {
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 * Requires authenticate middleware (req.user is already set).
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authRepository.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return responseHandler.success(res, {
      user: authService.sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refreshToken, getMe };
