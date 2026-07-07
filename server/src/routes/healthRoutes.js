// src/routes/healthRoutes.js
// Health check routes for database connectivity.
// These routes are PUBLIC — no authentication required.
//
// GET /api/health/db — Test PostgreSQL connection by running SELECT NOW()
//
// NOTE: The existing GET /api/health route (in app.js) is NOT affected.

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /api/health/db
 * Test the PostgreSQL database connection.
 * Runs a simple SELECT NOW() query to verify connectivity.
 */
router.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return res.json({
      success: true,
      message: 'Database connected successfully',
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

module.exports = router;
