/**
 * Custom Jest resolver for handling problematic modules
 * This will help Jest resolve imports for React Native, Expo, and other native modules
 */

module.exports = (path, options) => {
  // Return empty mock for problematic modules
  const problemModules = [
    '@react-native/js-polyfills',
    '@react-native/normalize-colors',
    'react-native-reanimated',
    'react-native/Libraries',
    'expo-modules-core'
  ];
  
  if (problemModules.some(mod => path.includes(mod))) {
    return options.defaultResolver(require.resolve('./__mocks__/empty.js'), options);
  }
  
  // Otherwise use default resolver
  return options.defaultResolver(path, options);
};
