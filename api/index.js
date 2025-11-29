// ============================================
// VERCEL SERVERLESS API ENDPOINT
// ============================================
// This file serves the entire Express backend as a Vercel serverless function

// Load environment variables
require('dotenv').config({ path: '../backend/.env' });

// Import the Express app
const app = require('../backend/src/index');

// Export for Vercel serverless
module.exports = app;
