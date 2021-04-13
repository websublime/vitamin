/* eslint-disable @typescript-eslint/no-var-requires */

const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  collectCoverage: true,
  globals: {
    __USE_BUILD__: process.argv.indexOf('-use-build') >= 0,
    // work around: https://github.com/kulshekhar/ts-jest/issues/748#issuecomment-423528659
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001]
      },
      tsconfig: './tsconfig.json'
    }
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  preset: 'ts-jest',
  setupFiles: ['./setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.vue?$': 'vue-jest'
  }
};
