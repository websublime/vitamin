/* eslint-disable unicorn/prefer-module */
const vitaPlugin = require('./dist/index.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./www/**/*.{html,js}'],
  plugins: [vitaPlugin({})],
  theme: {
    extend: {}
  }
};
