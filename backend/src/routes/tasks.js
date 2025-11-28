// ============================================
// TASK ROUTES - CRUD OPERATIONS
// ============================================
// Routes for creating, reading, updating, and deleting tasks

const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// POST /tasks - Create a new task
// ============================================
router.post('/tasks', auth, async (req, res) => {
  try {
    // Create task with owner set to logged-in user
    const task = new Task({
      ...req.body,           // Spread operator: copies all fields from body
      owner: req.user._id    // Set owner to current user's ID
    });

    await task.save();
    res.status(201).send(task);

  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// ============================================
// GET /tasks - Get all tasks for current user
// ============================================
// Supports query parameters for filtering and pagination:
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc

router.get('/tasks', auth, async (req, res) => {
  try {
    // Build filter object
    const match = {};

    // Filter by completed status if provided
    // NOTE: req.query.completed is a string, so we compare it to 'true'
    // This comparison returns a boolean: true if string is 'true', false otherwise
    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }

    // Build sort object
    const sort = {};

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Find tasks owned by current user
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit) || 0,     // 0 = no limit
        skip: parseInt(req.query.skip) || 0,
        sort
      }
    });

    res.send(req.user.tasks);

  } catch (error) {
    res.status(500).send();
  }
});

// ============================================
// GET /tasks/:id - Get a specific task by ID
// ============================================
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // Find task that matches ID AND belongs to current user
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    res.send(task);

  } catch (error) {
    res.status(500).send();
  }
});

// ============================================
// PATCH /tasks/:id - Update a task
// ============================================
router.patch('/tasks/:id', auth, async (req, res) => {
  // Validate updates
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];

  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    // Find task that belongs to current user
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    // Apply updates
    updates.forEach((update) => {
      task[update] = req.body[update];
    });

    await task.save();
    res.send(task);

  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// ============================================
// DELETE /tasks/:id - Delete a task
// ============================================
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // Find and delete task that belongs to current user
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    res.send(task);

  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

// ============================================
// LEARNING NOTES
// ============================================
//
// CRUD OPERATIONS:
// - Create: POST /tasks
// - Read: GET /tasks, GET /tasks/:id
// - Update: PATCH /tasks/:id
// - Delete: DELETE /tasks/:id
//
// ROUTE PARAMETERS:
// - /tasks/:id defines a parameter named 'id'
// - Access with req.params.id
// - Example: GET /tasks/123 → req.params.id = '123'
//
// QUERY PARAMETERS (always strings!):
// - /tasks?completed=true&limit=10
// - Access with req.query
// - req.query.completed = 'true' (string, not boolean!)
// - req.query.limit = '10' (string, not number!)
// - Convert: req.query.completed === 'true' returns boolean
// - Convert: parseInt(req.query.limit) returns number
//
// OWNERSHIP & SECURITY:
// - Always check owner field: { owner: req.user._id }
// - Users can only access their own tasks
// - Prevents users from accessing other users' data
//
// POPULATION:
// - req.user.populate('tasks') fills in the tasks virtual field
// - Replaces task IDs with actual task documents
// - Very useful for getting related data
//
// FILTERING & SORTING:
// - match: filters results
// - sort: { field: 1 } for ascending, { field: -1 } for descending
// - limit: max number of results
// - skip: number of results to skip (for pagination)
//
// SPREAD OPERATOR:
// - ...req.body copies all properties from req.body
// - Then we add/override with owner: req.user._id
//
// TESTING EXAMPLES:
//
// Create task:
// POST http://localhost:3000/tasks
// Header: Authorization: Bearer <token>
// Body: { "description": "Learn Express" }
//
// Get all tasks:
// GET http://localhost:3000/tasks
// Header: Authorization: Bearer <token>
//
// Get completed tasks only:
// GET http://localhost:3000/tasks?completed=true
// Header: Authorization: Bearer <token>
//
// Update task:
// PATCH http://localhost:3000/tasks/123
// Header: Authorization: Bearer <token>
// Body: { "completed": true }
//
// Delete task:
// DELETE http://localhost:3000/tasks/123
// Header: Authorization: Bearer <token>
