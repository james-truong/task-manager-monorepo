const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123'
};

const testUser2 = {
  name: 'Test User 2',
  email: 'test2@example.com',
  password: 'testpassword123'
};

// Test task data
const testTask = {
  description: 'Test task',
  completed: false,
  priority: 'medium'
};

// Setup: Connect to test database before all tests
beforeAll(async () => {
  const testDbUrl = process.env.MONGODB_TEST_URL || 'mongodb://localhost:27017/task-manager-test';
  await mongoose.connect(testDbUrl);
});

// Cleanup: Clear database before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
});

// Teardown: Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Task Endpoints', () => {
  let token;
  let userId;

  // Helper function to create and login a user
  const setupUser = async (userData = testUser) => {
    const response = await request(app).post('/users/signup').send(userData);
    return {
      token: response.body.token,
      userId: response.body.user._id
    };
  };

  beforeEach(async () => {
    const user = await setupUser();
    token = user.token;
    userId = user.userId;
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(testTask)
        .expect(201);

      expect(response.body.description).toBe(testTask.description);
      expect(response.body.completed).toBe(testTask.completed);
      expect(response.body.priority).toBe(testTask.priority);
      expect(response.body.owner).toBe(userId);
      expect(response.body._id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should create a task with due date', async () => {
      const dueDate = new Date('2024-12-31');
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testTask,
          dueDate: dueDate.toISOString()
        })
        .expect(201);

      expect(response.body.dueDate).toBeDefined();
    });

    it('should create a task with high priority', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'High priority task',
          priority: 'high'
        })
        .expect(201);

      expect(response.body.priority).toBe('high');
    });

    it('should not create task without authentication', async () => {
      await request(app)
        .post('/tasks')
        .send(testTask)
        .expect(401);
    });

    it('should not create task without description', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ completed: false })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create multiple tasks
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Task 1', completed: false, priority: 'low' });

      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Task 2', completed: true, priority: 'medium' });

      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Task 3', completed: false, priority: 'high' });
    });

    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].owner).toBe(userId);
    });

    it('should filter completed tasks', async () => {
      const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].completed).toBe(true);
    });

    it('should filter incomplete tasks', async () => {
      const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach(task => {
        expect(task.completed).toBe(false);
      });
    });

    it('should limit number of tasks returned', async () => {
      const response = await request(app)
        .get('/tasks?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should sort tasks by createdAt descending', async () => {
      const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body[0].description).toBe('Task 3'); // Most recent
    });

    it('should not get tasks without authentication', async () => {
      await request(app)
        .get('/tasks')
        .expect(401);
    });

    it('should only return tasks owned by authenticated user', async () => {
      // Create another user with tasks
      const user2 = await setupUser(testUser2);
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ description: 'User 2 task' });

      // Get tasks for first user
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(3); // Should not include user2's task
      response.body.forEach(task => {
        expect(task.owner).toBe(userId);
      });
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(testTask);
      taskId = response.body._id;
    });

    it('should get a task by id', async () => {
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe(taskId);
      expect(response.body.description).toBe(testTask.description);
    });

    it('should not get task without authentication', async () => {
      await request(app)
        .get(`/tasks/${taskId}`)
        .expect(401);
    });

    it('should not get task that does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should not get task owned by another user', async () => {
      // Create another user and their task
      const user2 = await setupUser(testUser2);
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user2.token}`)
        .send(testTask);
      const user2TaskId = response.body._id;

      // Try to get user2's task with user1's token
      await request(app)
        .get(`/tasks/${user2TaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(testTask);
      taskId = response.body._id;
    });

    it('should update task description', async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated task' })
        .expect(200);

      expect(response.body.description).toBe('Updated task');
    });

    it('should update task completion status', async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    it('should update task priority', async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ priority: 'high' })
        .expect(200);

      expect(response.body.priority).toBe('high');
    });

    it('should update multiple fields at once', async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Updated task',
          completed: true,
          priority: 'low'
        })
        .expect(200);

      expect(response.body.description).toBe('Updated task');
      expect(response.body.completed).toBe(true);
      expect(response.body.priority).toBe('low');
    });

    it('should not update task without authentication', async () => {
      await request(app)
        .patch(`/tasks/${taskId}`)
        .send({ description: 'Updated task' })
        .expect(401);
    });

    it('should not update task owned by another user', async () => {
      // Create another user
      const user2 = await setupUser(testUser2);

      // Try to update user1's task with user2's token
      await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ description: 'Hacked' })
        .expect(404);

      // Verify task was not updated
      const task = await Task.findById(taskId);
      expect(task.description).toBe(testTask.description);
    });

    it('should not update with invalid priority', async () => {
      await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ priority: 'invalid' })
        .expect(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(testTask);
      taskId = response.body._id;
    });

    it('should delete a task', async () => {
      await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify task is deleted
      const task = await Task.findById(taskId);
      expect(task).toBeNull();
    });

    it('should not delete task without authentication', async () => {
      await request(app)
        .delete(`/tasks/${taskId}`)
        .expect(401);

      // Verify task still exists
      const task = await Task.findById(taskId);
      expect(task).toBeDefined();
    });

    it('should not delete task owned by another user', async () => {
      // Create another user
      const user2 = await setupUser(testUser2);

      // Try to delete user1's task with user2's token
      await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(404);

      // Verify task still exists
      const task = await Task.findById(taskId);
      expect(task).toBeDefined();
    });

    it('should not delete task that does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('Task ownership and security', () => {
    it('should cascade delete tasks when user is deleted', async () => {
      // Create tasks for user
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Task 1' });

      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Task 2' });

      // Verify tasks exist
      let tasks = await Task.find({ owner: userId });
      expect(tasks).toHaveLength(2);

      // Delete user
      await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify tasks are deleted
      tasks = await Task.find({ owner: userId });
      expect(tasks).toHaveLength(0);
    });
  });
});
