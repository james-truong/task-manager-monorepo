// ============================================
// MAIN SERVER FILE
// ============================================
// This is the entry point for our Express application
// It imports the configured app and starts the server

// Load environment variables from .env file
require('dotenv').config();

// Import database connection
require('./db/mongoose');

// Import the configured Express app
const app = require('./app');

// Get port from environment variable or use 3000
const port = process.env.PORT || 3000;

// ============================================
// START SERVER
// ============================================
app.listen(port, () => {
  console.log('🚀 Server is running!');
  console.log(`📍 Port: ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log('\n✨ Ready to accept requests!');
});

// ============================================
// LEARNING NOTES
// ============================================
//
// EXPRESS APPLICATION:
// - express() creates an Express app
// - Think of it as the core of your web server
//
// MIDDLEWARE:
// - Functions that process requests before they reach route handlers
// - app.use() registers middleware
// - express.json() parses JSON request bodies
// - Middleware runs in the order you define it
//
// ROUTERS:
// - Modular route handlers
// - Keep related routes together
// - authRouter handles /users/* routes
// - taskRouter handles /tasks/* routes
//
// ENVIRONMENT VARIABLES:
// - Stored in .env file
// - Accessed via process.env.VARIABLE_NAME
// - Never commit .env to git! (it's in .gitignore)
// - Good for: API keys, database URLs, ports
//
// app.listen():
// - Starts the server
// - First argument: port number
// - Second argument: callback when server starts
//
// PORT CONFIGURATION:
// - process.env.PORT || 3000
// - Use environment variable if set
// - Fall back to 3000 if not set
// - Useful for deployment (Heroku sets PORT automatically)
//
// REQUEST FLOW:
// 1. Client sends HTTP request
// 2. Express receives it
// 3. Middleware processes it (express.json())
// 4. Routes handle it (authRouter or taskRouter)
// 5. Response sent back to client
//
// TESTING THE SERVER:
// 1. Start: npm run dev
// 2. Visit: http://localhost:3000
// 3. Should see welcome message with API endpoints
