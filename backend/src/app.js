// ============================================
// EXPRESS APP CONFIGURATION
// ============================================
// This file configures the Express app without starting the server
// Separating this allows tests to import the app without starting a server

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Import routers
const authRouter = require('./routes/auth');
const taskRouter = require('./routes/tasks');

// Create Express application
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security Headers - Protect against common vulnerabilities
// Helmet sets various HTTP headers to secure the app
// Configure CORP to allow cross-origin image loading (needed for avatars)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Allow frontend to communicate with backend
// In development: allow localhost
// In production: allow the frontend URL
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
// ROOT ROUTE - API Info
// ============================================
app.get('/', (req, res) => {
  res.send({
    message: 'Noted API',
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

// Export the app for use in tests and server
module.exports = app;
