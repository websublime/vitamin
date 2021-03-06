module.exports = {
  darkMode: 'class',
  // mode: 'jit',
  plugins: [],
  purge: {
    content: ['./src/**/*.html', './src/**/*.js'],
    enabled: true,
    layers: ['base', 'utilities'],
    options: {
      keyframes: true,
      variables: true
    }
  },
  // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    appearance: [],
    extend: {
      cursor: ['disabled'],
      opacity: ['disabled'],
      textColor: ['visited', 'disabled']
    }
  }
};
