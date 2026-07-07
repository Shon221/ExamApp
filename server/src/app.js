// src/app.js
// This file creates the Express application, sets up all middleware and routes.
// It is separate from server.js so that in the future it can be tested independently.

const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');

// Import all route files
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const questionRoutes = require('./routes/questions');
const studentRoutes = require('./routes/student');
const lecturerRoutes = require('./routes/lecturer');

const app = express();

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Allow requests from the React frontend running on port 5173
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies / Authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing Middleware ──────────────────────────────────────────────────
// Parse incoming JSON request bodies (like { email, password })
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exams', questionRoutes);     // nested: /api/exams/:examId/questions
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// If no route matched, return a 404 error
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
// Must be the LAST middleware (after all routes)
app.use(errorHandler);

module.exports = app;
