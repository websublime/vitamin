module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx,html}'
  ],
  darkMode: 'media',
  // mode: 'jit',
  plugins: [
    require('@websublime/vitamin-theme')
  ],
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      borderWidth: ['hover', 'focus'],
      cursor: ['disabled'],
      opacity: ['disabled'],
      outline: ['hover', 'active'],
      textColor: ['visited', 'disabled']
    }
  }
};
