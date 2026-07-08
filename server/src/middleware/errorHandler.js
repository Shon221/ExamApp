// src/middleware/errorHandler.js
// This is the CENTRALIZED error handling middleware.
// All errors thrown with next(error) end up here.
// It ensures every error response has the same consistent structure.
//
// How it works:
//   1. A route or controller calls next(error)
//   2. Express skips all normal middleware and comes here
//   3. We log the error and send a clean JSON response

const logger = require('../utils/logger');

/**
 * Express Error Handler Middleware
 * Must have 4 parameters: (err, req, res, next)
 * Express identifies error handlers by the 4-parameter signature.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details on the server (not sent to client)
  logger.error(`${err.message} | Route: ${req.method} ${req.originalUrl}`);

  // If in development mode, also log the full stack trace
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Determine the status code
  // Use err.statusCode if it was set, otherwise default to 500
  const statusCode = err.statusCode || 500;

  // Send a clean, consistent error response to the client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

/**
 * Helper to create a custom error with a status code.
 * Usage: throw createError(404, 'Exam not found')
 *
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = errorHandler;
module.exports.createError = createError;
