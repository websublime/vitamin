module.exports = {
  darkMode: 'class',
  mode: 'jit',
  plugins: [],
  purge: [
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.md'
  ],
  // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      cursor: ['disabled'],
      opacity: ['disabled'],
      textColor: ['visited', 'disabled']
    }
  }
};
