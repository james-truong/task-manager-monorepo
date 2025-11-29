// ============================================
// MAIN SERVER FILE
// ============================================
// This is the entry point for our Express application

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import database connection
require('./db/mongoose');

// Import routers
const authRouter = require('./routes/auth');
const taskRouter = require('./routes/tasks');

// Create Express application
const app = express();

// Get port from environment variable or use 3000
const port = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow frontend to communicate with backend
// In development: allow localhost
// In production (Vercel monorepo): allow the frontend URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - prevent spam/abuse
// Limits each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Parse incoming JSON requests
// This makes req.body available in our route handlers
app.use(express.json());

// Register routers
app.use(authRouter);
app.use(taskRouter);

// ============================================
// STATIC FILES - Serve frontend in production
// ============================================
if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  // Serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // Catch-all route - serve index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
} else {
  // Development mode - show API info
  app.get('/', (req, res) => {
    res.send({
      message: 'Task Manager API',
      version: '1.0.0',
      endpoints: {
        auth: {
          signup: 'POST /users/signup',
          login: 'POST /users/login',
          logout: 'POST /users/logout',
          profile: 'GET /users/me'
        },
        tasks: {
          create: 'POST /tasks',
          getAll: 'GET /tasks',
          getOne: 'GET /tasks/:id',
          update: 'PATCH /tasks/:id',
          delete: 'DELETE /tasks/:id'
        }
      }
    });
  });
}

// ============================================
// START SERVER (Local Development Only)
// ============================================
// For local development: start the server
// For Vercel: export the app (server started by Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log('🚀 Server is running!');
    console.log(`📍 Port: ${port}`);
    console.log(`🌐 URL: http://localhost:${port}`);
    console.log('\n✨ Ready to accept requests!');
  });
}

// Export the Express app for Vercel serverless functions
module.exports = app;

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
