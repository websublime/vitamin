/* eslint-disable unicorn/prefer-module */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./www/index.html'],
  plugins: [require('./dist/index.js')()],
  theme: {
    extend: {}
  }
};
