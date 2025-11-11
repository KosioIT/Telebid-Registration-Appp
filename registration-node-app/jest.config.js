export default {
  // automatically load the setup file before each test
  // setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Minimum 80% coverage
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Only run tests in the tests folder
  testMatch: ["**/tests/**/*.test.js"],

  // ES modules
  transform: {},
};
