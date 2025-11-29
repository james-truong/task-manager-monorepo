// ============================================
// DATABASE CONNECTION - MONGOOSE
// ============================================
// This file handles connecting to MongoDB using Mongoose
// Mongoose is an ODM (Object Document Mapper) that makes working with MongoDB easier

const mongoose = require('mongoose');

// Connection options optimized for serverless environments
// Vercel functions have limited connections, so we optimize pooling
const options = {
  maxPoolSize: 10,            // Max 10 concurrent connections (Vercel recommendation)
  serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,      // Close sockets after 45s of inactivity
};

// Debug: Log connection string info (without exposing password)
const connStr = process.env.MONGODB_URL;
console.log('🔍 MongoDB Connection Debug:');
console.log('  - Connection string defined:', !!connStr);
console.log('  - Connection string length:', connStr?.length);
console.log('  - Starts with mongodb+srv:', connStr?.startsWith('mongodb+srv:'));
console.log('  - Contains newline:', connStr?.includes('\n'));
console.log('  - Contains carriage return:', connStr?.includes('\r'));
console.log('  - First 20 chars:', connStr?.substring(0, 20));

// Connect to MongoDB
// mongoose.connect() returns a Promise
mongoose.connect(process.env.MONGODB_URL, options)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    // In serverless, don't exit - let function retry
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// LEARNING NOTES:
//
// What is MongoDB?
// - NoSQL database (stores data as documents, not tables)
// - Documents are stored as JSON-like objects
// - Flexible schema (fields can vary between documents)
//
// What is Mongoose?
// - Makes MongoDB easier to work with in Node.js
// - Provides schemas (structure for your data)
// - Built-in validation
// - Middleware hooks
// - Query helpers
//
// Connection String Format:
// mongodb://localhost:27017/database-name
// - localhost:27017 = where MongoDB is running
// - task-manager = database name (created automatically)
