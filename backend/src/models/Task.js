// ============================================
// TASK MODEL - MONGOOSE SCHEMA
// ============================================
// This file defines the structure of Task documents in MongoDB

const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false       // Tasks are incomplete by default
  },
  dueDate: {
    type: Date,
    required: false      // Optional - not all tasks need a due date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],  // Only these values are allowed
    default: 'medium'    // Default priority is medium
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to User's _id
    required: true,
    ref: 'User'          // Reference to User model (for population)
  }
}, {
  timestamps: true       // Adds createdAt and updatedAt automatically
});

// Create the model from the schema
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

// ============================================
// LEARNING NOTES
// ============================================
//
// RELATIONSHIPS IN MONGODB:
// - MongoDB is "non-relational" but we can still create relationships
// - We store the ObjectId of the related document
// - mongoose.Schema.Types.ObjectId defines an ID reference
// - ref: 'User' tells Mongoose which model the ID relates to
//
// POPULATION:
// - Mongoose feature to automatically replace IDs with actual documents
// - Example: task.populate('owner') would replace owner ID with full user object
//
// DEFAULT VALUES:
// - You can set default values for fields
// - completed: false means all new tasks start as incomplete
//
// TIMESTAMPS:
// - timestamps: true automatically adds:
//   - createdAt: when document was created
//   - updatedAt: when document was last modified
// - Very useful for tracking when tasks were created/updated
