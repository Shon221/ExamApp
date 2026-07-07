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
const mockData = require('../data/mockData');

/**
 * Middleware to verify the JWT token.
 * Adds req.user = { id, email, role } if the token is valid.
 */
const authenticate = (req, res, next) => {
  // Get the Authorization header value
  const authHeader = req.headers['authorization'];

  // Check that the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Please log in.',
    });
  }

  // Extract just the token part (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with our secret key
    // If the token is expired or tampered with, this will throw an error
    const decoded = jwt.verify(token, env.jwtSecret);

    // Find the user in our mock data to make sure they still exist
    const user = mockData.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Attach the decoded user payload to the request object
    // Now req.user is available in all subsequent middleware and controllers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
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
