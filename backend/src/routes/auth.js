// ============================================
// AUTHENTICATION ROUTES
// ============================================
// Routes for user signup, login, logout, and profile

const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// POST /users/signup - Create new user
// ============================================
router.post('/users/signup', async (req, res) => {
  try {
    // Create new user from request body
    const user = new User(req.body);

    // Save user to database
    // Password will be automatically hashed by middleware
    await user.save();

    // Generate authentication token
    const token = await user.generateAuthToken();

    // Send user and token back
    res.status(201).send({ user, token });

  } catch (error) {
    // Handle errors (validation, duplicate email, etc.)
    res.status(400).send({ error: error.message });
  }
});

// ============================================
// POST /users/login - Login existing user
// ============================================
router.post('/users/login', async (req, res) => {
  try {
    // Find user by email and verify password
    // This uses our custom static method
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    // Generate new authentication token
    const token = await user.generateAuthToken();

    res.send({ user, token });

  } catch (error) {
    res.status(400).send({ error: 'Invalid login credentials' });
  }
});

// ============================================
// POST /users/logout - Logout (remove current token)
// ============================================
router.post('/users/logout', auth, async (req, res) => {
  try {
    // Remove the current token from user's tokens array
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send({ message: 'Logged out successfully' });

  } catch (error) {
    res.status(500).send();
  }
});

// ============================================
// POST /users/logoutAll - Logout from all devices
// ============================================
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    // Clear all tokens (logout from all devices)
    req.user.tokens = [];
    await req.user.save();

    res.send({ message: 'Logged out from all devices' });

  } catch (error) {
    res.status(500).send();
  }
});

// ============================================
// GET /users/me - Get current user profile
// ============================================
router.get('/users/me', auth, async (req, res) => {
  // req.user is set by auth middleware
  res.send(req.user);
});

// ============================================
// PATCH /users/me - Update user profile
// ============================================
router.patch('/users/me', auth, async (req, res) => {
  // Get the fields user wants to update
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];

  // Check if all updates are allowed
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    // Apply each update to the user
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.send(req.user);

  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// ============================================
// DELETE /users/me - Delete user account
// ============================================
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send(req.user);

  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

// ============================================
// LEARNING NOTES
// ============================================
//
// EXPRESS ROUTER:
// - Creates modular route handlers
// - router = mini Express application
// - Export and use in main app with app.use()
//
// REST API CONVENTIONS:
// - POST = Create new resource
// - GET = Read/retrieve resource
// - PATCH/PUT = Update resource
// - DELETE = Delete resource
//
// HTTP STATUS CODES:
// - 200: Success
// - 201: Created (successful POST)
// - 400: Bad Request (validation error)
// - 401: Unauthorized (not authenticated)
// - 404: Not Found
// - 500: Server Error
//
// ASYNC/AWAIT IN ROUTES:
// - All database operations are async
// - Use try/catch for error handling
// - Always send a response (res.send())
//
// PROTECTED ROUTES:
// - Routes with 'auth' middleware require authentication
// - User must send valid JWT token
// - req.user is available in handler
//
// REQUEST BODY:
// - req.body contains data sent from client
// - Requires express.json() middleware to parse
//
// TESTING THESE ROUTES:
// You'll need a tool like Postman or Thunder Client
// Examples:
//
// Signup:
// POST http://localhost:3000/users/signup
// Body: { "name": "John", "email": "john@example.com", "password": "pass123" }
//
// Login:
// POST http://localhost:3000/users/login
// Body: { "email": "john@example.com", "password": "pass123" }
//
// Get Profile (needs token):
// GET http://localhost:3000/users/me
// Header: Authorization: Bearer <token-from-login>
