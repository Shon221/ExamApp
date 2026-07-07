// src/dbConfig.js
// Shared PostgreSQL connection configuration for the app and database scripts.

const isLocalDatabaseUrl = (databaseUrl = '') => {
  return (
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1') ||
    databaseUrl.includes('::1')
  );
};

const getSslConfig = () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  const databaseSsl = (process.env.DATABASE_SSL || '').toLowerCase();

  if (['false', '0', 'disable', 'disabled', 'no'].includes(databaseSsl)) {
    return false;
  }

  if (['true', '1', 'require', 'required', 'yes'].includes(databaseSsl)) {
    return { rejectUnauthorized: false };
  }

  return databaseUrl && !isLocalDatabaseUrl(databaseUrl)
    ? { rejectUnauthorized: false }
    : false;
};

const getPgConfig = () => ({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
});

module.exports = {
  getPgConfig,
  getSslConfig,
};
