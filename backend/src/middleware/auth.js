// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This middleware protects routes that require authentication
// It verifies the JWT token and attaches the user to the request

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 1. Get the token from the Authorization header
    // Header format: "Bearer <token>"
    const token = req.header('Authorization').replace('Bearer ', '');

    // 2. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user with this ID who still has this token
    // (User might have logged out, removing the token)
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    });

    if (!user) {
      throw new Error();
    }

    // 4. Attach user and token to the request
    // This makes them available in route handlers
    req.user = user;
    req.token = token;

    // 5. Call next() to continue to the route handler
    next();

  } catch (error) {
    // Token is invalid or missing
    res.status(401).send({ error: 'Please authenticate' });
  }
};

module.exports = auth;

// ============================================
// LEARNING NOTES
// ============================================
//
// MIDDLEWARE IN EXPRESS:
// - Functions that run before route handlers
// - Have access to req, res, and next
// - Can modify req/res objects
// - Must call next() to continue, or send a response to stop
//
// AUTHENTICATION FLOW:
// 1. Client sends request with token in header
// 2. Middleware extracts token
// 3. Middleware verifies token
// 4. Middleware finds user in database
// 5. Middleware attaches user to request
// 6. Route handler can access req.user
//
// JWT VERIFICATION:
// - jwt.verify() decodes and validates the token
// - Checks if token was signed with our secret key
// - Checks if token has expired
// - Throws error if token is invalid
//
// AUTHORIZATION HEADER:
// - Standard way to send auth tokens
// - Format: "Authorization: Bearer <token>"
// - We extract the token by removing "Bearer " prefix
//
// HOW TO USE THIS MIDDLEWARE:
// router.get('/protected-route', auth, async (req, res) => {
//   // req.user is now available here!
//   res.send(req.user);
// });
