// server.js
// This is the entry point of our backend server.
// It loads environment variables, then starts the Express app on the configured port.

require('dotenv').config(); // Load .env file FIRST, before anything else

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
