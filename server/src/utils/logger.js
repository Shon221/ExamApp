// src/utils/logger.js
// A simple console-based logger.
// In a real production app you would use a library like Winston or Pino.
// For now, this gives us colorful, timestamped log messages.

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// Helper to get current timestamp
const timestamp = () => new Date().toISOString();

const logger = {
  // General info message
  info: (message) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${timestamp()} - ${message}`);
  },

  // Success action
  success: (message) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${timestamp()} - ${message}`);
  },

  // Warning
  warn: (message) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${timestamp()} - ${message}`);
  },

  // Error
  error: (message) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp()} - ${message}`);
  },

  // Authentication events
  auth: (message) => {
    console.log(`${colors.blue}[AUTH]${colors.reset} ${timestamp()} - ${message}`);
  },
};

module.exports = logger;
