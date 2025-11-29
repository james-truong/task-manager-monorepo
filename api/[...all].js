// ============================================
// VERCEL SERVERLESS API CATCH-ALL ROUTE
// ============================================
// This catches all /api/* routes and forwards them to Express

// Import the Express app
const app = require('../backend/src/index');

// Export a Vercel serverless function handler
module.exports = async (req, res) => {
  // Let Express handle the request
  return app(req, res);
};
