// src/config/env.js
// Centralizes access to environment variables.
// Instead of writing process.env.SOMETHING everywhere, import this file.
// This also gives you one place to document and validate your env variables.

const env = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Warn if JWT_SECRET is not set (important for production security)
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set in .env file. Using fallback (not safe for production).');
}

module.exports = env;
