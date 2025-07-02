// Custom transformer for Expo modules in Jest
const config = {
  process(src, filename) {
    return {
      code: `
        // Mock implementation for problematic Expo modules
        module.exports = new Proxy({}, {
          get: function(target, prop) {
            if (prop === 'then') {
              return undefined; // Not a Promise
            }
            return () => ({});
          }
        });
      `,
    };
  },
};

module.exports = config;
