// src/db.js
// PostgreSQL connection pool using the shared database configuration.

const { Pool } = require('pg');
const { getPgConfig } = require('./dbConfig');

const pool = new Pool(getPgConfig());

// Log connection status on first connect
pool.on('connect', () => {
  console.log('🗄️  PostgreSQL pool: client connected');
});

pool.on('error', (err) => {
  console.error('🗄️  PostgreSQL pool error:', err.message);
});

module.exports = pool;
