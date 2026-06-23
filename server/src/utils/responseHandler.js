// src/utils/responseHandler.js
// Provides helper functions for sending consistent API responses.
// Every success and error response follows the same structure:
//   Success: { success: true,  data: {...} }
//   Error:   { success: false, message: "..." }

const responseHandler = {
  /**
   * Send a successful response with data.
   * @param {object} res - Express response object
   * @param {object} data - The data payload to send
   * @param {number} statusCode - HTTP status code (default 200)
   */
  success: (res, data, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      data,
    });
  },

  /**
   * Send a successful response with just a message (no data payload).
   * @param {object} res - Express response object
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default 200)
   */
  successMessage: (res, message, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
    });
  },

  /**
   * Send a 201 Created response with data.
   * Use this when creating a new resource (user, exam, question, etc.)
   * @param {object} res - Express response object
   * @param {object} data - The created resource
   */
  created: (res, data) => {
    res.status(201).json({
      success: true,
      data,
    });
  },

  /**
   * Send an error response.
   * @param {object} res - Express response object
   * @param {string} message - Error message to send to the client
   * @param {number} statusCode - HTTP status code (default 500)
   */
  error: (res, message, statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      message,
    });
  },
};

module.exports = responseHandler;
