// ============================================
// VERCEL SERVERLESS API ENDPOINT
// ============================================
// This file serves the entire Express backend as a Vercel serverless function

// Import the Express app
const app = require('../backend/src/index');

// Export a Vercel serverless function handler
module.exports = async (req, res) => {
  // Let Express handle the request
  return app(req, res);
};
