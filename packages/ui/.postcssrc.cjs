/* eslint-disable unicorn/prefer-module */
/* eslint-disable sort-keys */
module.exports = {
  plugins: [require('postcss-import'), require('@tailwindcss/nesting'), require('tailwindcss')({ config: './tailwind.config.cjs' }), require('autoprefixer')]
};
