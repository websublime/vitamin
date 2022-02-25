const baseRules = require('./rules/base')
const vueRules = require('./rules/vue')
const typescriptRules = require('./rules/typescript')

const configs = ['plugin:vue/recommended', '@vue/typescript/recommended']

const plugins = [
  'import',
  'jest',
  'new-with-error',
  'simple-import-sort',
  'sort-class-members',
  'sort-destructure-keys',
  'switch-case',
]

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: configs,
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins,
  rules: {
    ...baseRules,
    ...vueRules,
    ...typescriptRules,
  },
}
