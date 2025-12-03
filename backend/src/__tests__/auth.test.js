const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword123'
};

// Setup: Connect to test database before all tests
beforeAll(async () => {
  const testDbUrl = process.env.MONGODB_TEST_URL || 'mongodb://localhost:27017/task-manager-test';
  await mongoose.connect(testDbUrl);
});

// Cleanup: Clear database and rebuild indexes before each test
beforeEach(async () => {
  await User.collection.drop().catch(() => {}); // Drop collection (ignore error if doesn't exist)
  await User.createIndexes(); // Recreate indexes
});

// Teardown: Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  describe('POST /users/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send(testUser)
        .expect(201);

      // Check response
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned

      // Check database
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeDefined();
      expect(user.password).not.toBe(testUser.password); // Password should be hashed
    });

    it('should not create user with invalid email', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'testpassword123'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should not create user with duplicate email', async () => {
      // Create first user
      await request(app).post('/users/signup').send(testUser).expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/users/signup')
        .send(testUser)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should not create user with short password', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /users/login', () => {
    beforeEach(async () => {
      // Create a user to login with
      await request(app).post('/users/signup').send(testUser);
    });

    it('should login existing user', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /users/me', () => {
    let token;

    beforeEach(async () => {
      // Create and login user to get token
      const response = await request(app).post('/users/signup').send(testUser);
      token = response.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      await request(app)
        .get('/users/me')
        .expect(401);
    });

    it('should not get profile with invalid token', async () => {
      await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });

  describe('POST /users/logout', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app).post('/users/signup').send(testUser);
      token = response.body.token;
    });

    it('should logout user', async () => {
      await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Token should no longer work
      await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should not logout without token', async () => {
      await request(app)
        .post('/users/logout')
        .expect(401);
    });
  });
});
