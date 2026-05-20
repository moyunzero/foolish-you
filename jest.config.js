/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.ts'],
      setupFiles: ['<rootDir>/jest.setup.js'],
      modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
    },
    {
      displayName: 'rtl',
      preset: 'jest-expo',
      testMatch: ['**/__tests__/**/*.test.tsx'],
      setupFiles: ['<rootDir>/jest.setup.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.rtl.js'],
      modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
      maxWorkers: 1,
    },
  ],
};
