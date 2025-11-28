// ============================================
// USER MODEL - MONGOOSE SCHEMA
// ============================================
// This file defines the structure of User documents in MongoDB

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,      // Must provide a name
    trim: true           // Remove whitespace from both ends
  },
  email: {
    type: String,
    required: true,
    unique: true,        // No two users can have same email
    lowercase: true,     // Convert to lowercase
    trim: true,
    validate(value) {
      // Basic email validation
      if (!value.includes('@')) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,        // Minimum password length
    trim: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true       // Automatically add createdAt and updatedAt fields
});

// ============================================
// VIRTUAL FIELD - Relationship to Tasks
// ============================================
// This creates a virtual property (doesn't actually exist in the database)
// It defines the relationship between User and Task

userSchema.virtual('tasks', {
  ref: 'Task',           // Reference to Task model
  localField: '_id',     // User's _id field
  foreignField: 'owner'  // Task's owner field
});

// ============================================
// INSTANCE METHOD - Generate Auth Token
// ============================================
// Instance methods are available on individual user documents
// This method generates a JWT token for authentication

userSchema.methods.generateAuthToken = async function() {
  const user = this;

  // Create JWT token with user's _id
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7 days' }
  );

  // Save token to user's tokens array
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// ============================================
// INSTANCE METHOD - To JSON (hide private data)
// ============================================
// This method is called when user object is converted to JSON
// We use it to hide sensitive data like password and tokens

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  // Delete sensitive fields
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// ============================================
// STATIC METHOD - Find by credentials
// ============================================
// Static methods are available on the Model itself
// This method finds user by email and validates password

userSchema.statics.findByCredentials = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  // Compare provided password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// ============================================
// MIDDLEWARE - Hash password before saving
// ============================================
// This runs automatically before saving a user
// It hashes the password if it was modified

userSchema.pre('save', async function(next) {
  const user = this;

  // Only hash password if it was modified (or is new)
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next(); // Continue with save
});

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;

// ============================================
// LEARNING NOTES
// ============================================
//
// MONGOOSE SCHEMA:
// - Defines the structure and rules for documents
// - Field types, validation, defaults
//
// INSTANCE METHODS:
// - Methods available on individual documents
// - Example: user.generateAuthToken()
//
// STATIC METHODS:
// - Methods available on the Model
// - Example: User.findByCredentials()
//
// MIDDLEWARE:
// - Functions that run before/after certain operations
// - pre('save') runs before saving
// - post('save') runs after saving
//
// BCRYPT:
// - Library for hashing passwords
// - Never store plain text passwords!
// - bcrypt.hash() creates a hash
// - bcrypt.compare() checks if password matches hash
//
// JWT (JSON Web Tokens):
// - Used for authentication
// - Contains encoded user info
// - Signed with a secret key
// - Can set expiration time
