// src/db.js
// PostgreSQL connection pool using the 'pg' library.
// Connects to the database using DATABASE_URL from environment variables.
//
// NOTE: This file only establishes the connection pool.
// All existing routes still use mockData (server/src/data/mockData.js).
// The mockDB is kept as a backup / for local development during gradual migration.

const { Pool } = require('pg');

const shouldUseSSL =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('localhost') &&
  !process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL is required for Render's external PostgreSQL connections.
  ssl: shouldUseSSL
    ? { rejectUnauthorized: false }
    : false,
});

// Log connection status on first connect
pool.on('connect', () => {
  console.log('🗄️  PostgreSQL pool: client connected');
});

pool.on('error', (err) => {
  console.error('🗄️  PostgreSQL pool error:', err.message);
});

module.exports = pool;
