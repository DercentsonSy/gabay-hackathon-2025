// Minimal Jest configuration that completely bypasses Expo
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/minimal/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    // Map any potential module imports to empty mocks
    '^expo(.*)$': '<rootDir>/__tests__/mocks/empty-mock.js',
    '^react-native$': '<rootDir>/__tests__/mocks/empty-mock.js',
    '^@react-native(.*)$': '<rootDir>/__tests__/mocks/empty-mock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!axios)'
  ]
};
