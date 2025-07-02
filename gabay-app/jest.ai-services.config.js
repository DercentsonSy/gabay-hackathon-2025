// Custom Jest configuration for AI service tests
module.exports = {
  // Don't use jest-expo preset for these tests
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Transform TypeScript files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Only run files with .ai-test.ts suffix
  testRegex: '.*\\.ai-test\\.ts$',
  
  // Mock implementations for problematic modules
  moduleNameMapper: {
    // These modules won't be used in our isolated tests
    '^expo-av$': '<rootDir>/__tests__/mocks/empty-mock.js',
    '^expo-file-system$': '<rootDir>/__tests__/mocks/empty-mock.js',
    '^expo$': '<rootDir>/__tests__/mocks/empty-mock.js',
    '^react-native$': '<rootDir>/__tests__/mocks/empty-mock.js'
  },
  
  // Don't transform node_modules except for specific packages
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ]
};
