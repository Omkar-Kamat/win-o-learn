export default {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/modules/**/*.test.js'],
  globalSetup: '<rootDir>/globalSetup.js',
  setupFilesAfterEnv: ['<rootDir>/setupFilesAfterEnv.js'],
  transform: {},
  reporters: [
    'default',
    '<rootDir>/utils/reporter.js'
  ]
};
