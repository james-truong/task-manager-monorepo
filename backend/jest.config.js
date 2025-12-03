module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testTimeout: 30000, // Increased timeout for database operations
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  maxWorkers: 1 // Run tests sequentially to avoid database conflicts
};
