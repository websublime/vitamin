module.exports = {
  darkMode: 'class',
  plugins: [],
  purge: [
    './src/**/*.html',
    './src/**/*.js'
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
