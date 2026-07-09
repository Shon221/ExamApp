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
  // Always log the full error on the server side
  logger.error(`${err.message} | Route: ${req.method} ${req.originalUrl}`);

  // In development, also log the full stack trace for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Determine the HTTP status code.
  // Use err.statusCode if it was intentionally set (e.g. createError(404, ...)),
  // otherwise fall back to 500.
  const statusCode = err.statusCode || 500;

  // In production, never expose raw internal error messages (e.g. raw SQL errors)
  // to the client for errors that don't have an explicit statusCode set.
  // Only errors intentionally created with createError() carry a statusCode;
  // unhandled DB / runtime errors do not, and their message may contain sensitive
  // internals (column names, table names, stack details, etc.).
  const isInternalError = !err.statusCode;
  const clientMessage =
    isInternalError && process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
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
