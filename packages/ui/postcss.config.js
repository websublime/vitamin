/* eslint-disable unicorn/prefer-module */
/* eslint-disable sort-keys */
/* eslint-disable import/no-unresolved */
module.exports = {
  plugins: [
    require('postcss-import'),
    require('@tailwindcss/nesting'),
    require('tailwindcss')({ config: './tailwind.config.cjs' }),
    require('autoprefixer')
  ]
};
