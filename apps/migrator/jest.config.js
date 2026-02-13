module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  clearMocks: true,
  testEnvironment: 'node',
  forceExit: true,
  globalSetup: '@tokistack/test-utils/globalSetup',
  setupFilesAfterEnv: ['@tokistack/test-utils/setup'],
};
