/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['./jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
};
