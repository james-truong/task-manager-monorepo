// ============================================
// VERCEL SERVERLESS ENTRY POINT
// ============================================
// This file adapts the Express app for Vercel serverless functions
// Vercel will invoke this as a serverless function

const app = require('../src/index');

// Export the Express app for Vercel
// Vercel handles starting the server
module.exports = app;
