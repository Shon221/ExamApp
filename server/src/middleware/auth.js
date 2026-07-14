// src/middleware/auth.js
// Authentication and Authorization Middleware.
//
// authenticate: Verifies the JWT token in the Authorization header.
//   - Reads the token from: Authorization: Bearer <token>
//   - Decodes the token and attaches the user payload to req.user
//   - If the token is missing or invalid → returns 401 Unauthorized
//
// authorize(...roles): Checks if the authenticated user has the required role.
//   - Usage: authorize('lecturer') or authorize('lecturer', 'student')
//   - Must be used AFTER authenticate
//   - If the user's role doesn't match → returns 403 Forbidden

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const authRepository = require('../repositories/authRepository');

/**
 * Middleware to verify the JWT token.
 * Adds req.user = { id, email, role } if the token is valid.
 */
const authenticate = async (req, res, next) => {
  // Get the token from HttpOnly cookie or Authorization header as fallback
  let token = req.cookies.accessToken;

  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Check that the token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please log in.',
    });
  }

  try {
    // Verify the token with our secret key
    // If the token is expired or tampered with, this will throw an error
    const decoded = jwt.verify(token, env.jwtAccessSecret);

    // Find the user in PostgreSQL to make sure they still exist
    const user = await authRepository.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Attach the decoded user payload to the request object
    // Now req.user is available in all subsequent middleware and controllers
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next(); // Continue to the next middleware or controller
  } catch (error) {
    // Token is expired or invalid
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }
};

/**
 * Middleware factory for role-based authorization.
 * Call it with the allowed roles: authorize('lecturer') or authorize('student')
 * Must be used AFTER authenticate middleware.
 *
 * @param {...string} roles - The allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user was set by authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    // Check if the user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${roles.join(', ')}`,
      });
    }

    next(); // User has the required role, continue
  };
};

module.exports = { authenticate, authorize };
