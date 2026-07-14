// src/services/authService.js
// Handles all authentication logic:
//   - Generating JWT access tokens
//   - Generating refresh tokens
//   - Hashing passwords
//   - Comparing passwords
//
// By putting this logic in a service, our controllers stay clean and focused.

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const authRepository = require('../repositories/authRepository');

// Number of bcrypt salt rounds (higher = more secure but slower)
// 10 is a good balance for development
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt.
 * @param {string} password - The plain text password
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a bcrypt hash.
 * @param {string} password - The plain text password entered by the user
 * @param {string} hashedPassword - The stored bcrypt hash
 * @returns {Promise<boolean>} true if passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a JWT access token for a user.
 * The token contains: user id, email, role, name
 * It expires based on JWT_EXPIRES_IN in .env (e.g., '1h')
 *
 * @param {object} user - The user object
 * @returns {string} A signed JWT token string
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

/**
 * Generate a refresh token and store it in PostgreSQL.
 * Refresh tokens are long-lived (e.g., 7 days) and used to get new access tokens.
 *
 * @param {object} user - The user object
 * @returns {string} A signed JWT refresh token string
 */
const generateRefreshToken = async (user) => {
  const payload = {
    id: user.id,
    type: 'refresh', // Extra field to distinguish from access tokens
  };

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpiresIn,
  });

  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await authRepository.storeRefreshToken(refreshToken, user.id, expiresAt);

  return refreshToken;
};

/**
 * Verify a refresh token and return the stored token record.
 * @param {string} token - The refresh token string
 * @returns {{ decoded: object, storedToken: object } | null}
 */
const verifyRefreshToken = async (token) => {
  try {
    // Verify the token signature and expiry
    const decoded = jwt.verify(token, env.jwtRefreshSecret);

    // Check that this token was stored (not revoked on logout)
    const storedToken = await authRepository.getRefreshToken(token);

    if (!storedToken) {
      return null; // Token was revoked
    }

    return { decoded, storedToken };
  } catch (error) {
    return null; // Token is invalid or expired
  }
};

/**
 * Remove a refresh token from storage (used on logout).
 * @param {string} token - The refresh token to remove
 */
const revokeRefreshToken = (token) => {
  return authRepository.deleteRefreshToken(token);
};

/**
 * Remove the password field from a user object before sending to client.
 * NEVER send the password (even hashed) to the frontend.
 * @param {object} user - User object with password
 * @returns {object} User object without password
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  sanitizeUser,
};
