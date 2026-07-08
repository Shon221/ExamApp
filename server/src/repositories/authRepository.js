// src/repositories/authRepository.js
// PostgreSQL data access for authentication, users, and refresh tokens.

const pool = require('../db');
const { LEGACY_USER_IDS, toDbUserId } = require('./examsRepository');

const LEGACY_USER_UUIDS = Object.entries(LEGACY_USER_IDS).reduce((acc, [legacyId, uuid]) => {
  acc[uuid] = legacyId;
  return acc;
}, {});

const isUuid = (id) => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(id)
);

const toApiUserId = (userId) => LEGACY_USER_UUIDS[userId] || userId;

const toDbLookupUserId = (userId) => {
  const dbUserId = toDbUserId(userId);
  return isUuid(dbUserId) ? dbUserId : null;
};

const toApiUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: toApiUserId(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    created_at: row.created_at,
  };
};

const toApiRefreshToken = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    token: row.token,
    userId: toApiUserId(row.user_id),
    created_at: row.created_at,
  };
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password, role, created_at
       FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1`,
    [email]
  );

  return toApiUser(result.rows[0]);
};

const getUserById = async (userId) => {
  const dbUserId = toDbLookupUserId(userId);
  if (!dbUserId) {
    return null;
  }

  const result = await pool.query(
    `SELECT id, name, email, password, role, created_at
       FROM users
      WHERE id = $1`,
    [dbUserId]
  );

  return toApiUser(result.rows[0]);
};

const createUser = async ({ name, email, password, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, LOWER($2), $3, $4)
     RETURNING id, name, email, password, role, created_at`,
    [name, email, password, role]
  );

  return toApiUser(result.rows[0]);
};

const storeRefreshToken = async (token, userId) => {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (token, user_id)
     VALUES ($1, $2)
     RETURNING id, token, user_id, created_at`,
    [token, toDbUserId(userId)]
  );

  return toApiRefreshToken(result.rows[0]);
};

const getRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT id, token, user_id, created_at
       FROM refresh_tokens
      WHERE token = $1
      LIMIT 1`,
    [token]
  );

  return toApiRefreshToken(result.rows[0]);
};

const deleteRefreshToken = async (token) => {
  await pool.query(
    'DELETE FROM refresh_tokens WHERE token = $1',
    [token]
  );
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
};
