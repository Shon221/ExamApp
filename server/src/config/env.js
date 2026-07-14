// src/config/env.js
// Centralizes access to environment variables.
// Instead of writing process.env.SOMETHING everywhere, import this file.
// This also gives you one place to document and validate your env variables.

const env = {
  port: process.env.PORT || 3000,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in production!');
  }
  console.warn('⚠️  WARNING: JWT_ACCESS_SECRET or JWT_REFRESH_SECRET is not set in .env file. Using fallback (not safe for production).');
  env.jwtAccessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
  env.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
}

module.exports = env;
