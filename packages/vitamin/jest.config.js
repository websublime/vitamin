module.exports = {
  collectCoverage: true,
  globals: {
    __USE_BUILD__: process.argv.indexOf('-use-build') >= 0,
    // work around: https://github.com/kulshekhar/ts-jest/issues/748#issuecomment-423528659
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001]
      }
    }
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  preset: 'ts-jest',
  setupFiles: ['./setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\js$': 'babel-jest'
  }
};
