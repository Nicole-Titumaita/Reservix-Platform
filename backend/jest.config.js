module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js']
};
