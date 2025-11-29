// ============================================
// VERCEL SERVERLESS API CATCH-ALL ROUTE
// ============================================
// This catches all /api/* routes and forwards them to Express

// Import the Express app
const app = require('../backend/src/index');

// Export a Vercel serverless function handler
module.exports = async (req, res) => {
  // Strip /api prefix from the URL before passing to Express
  // Example: /api/users/signup -> /users/signup
  req.url = req.url.replace(/^\/api/, '') || '/';

  // Let Express handle the request with the modified URL
  return app(req, res);
};
