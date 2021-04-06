module.exports = {
  darkMode: 'class',
  // mode: 'jit',
  plugins: [],
  purge: {
    content: ['./src/**/*.html', './src/**/*.js'],
    layers: []
  },
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
