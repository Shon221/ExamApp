// src/services/idGenerator.js
// Provides unique ID generation for all entities.
// Uses the 'uuid' package to generate universally unique identifiers.
// UUID v4 generates a random ID like: "550e8400-e29b-41d4-a716-446655440000"
//
// Why not just use 1, 2, 3?
// - Sequential IDs are predictable and can be a security risk
// - UUIDs are random and collision-resistant
// - They work the same way when you switch to a real database later

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a new unique ID.
 * @returns {string} A UUID v4 string
 */
const generateId = () => {
  return uuidv4();
};

module.exports = { generateId };
