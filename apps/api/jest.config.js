module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  clearMocks: true,
  testEnvironment: 'node',
  globalSetup: '@tokistack/test-utils/globalSetup',
  setupFilesAfterEnv: ['@tokistack/test-utils/setup'],
};
