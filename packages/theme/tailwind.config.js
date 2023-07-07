/* eslint-disable unicorn/prefer-module */
const vitaPlugin = require('./dist/index.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./www/index.html'],
  plugins: [vitaPlugin({})],
  theme: {
    extend: {}
  }
};
