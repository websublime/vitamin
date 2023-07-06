import { withOptions } from 'tailwindcss/plugin.js';

export default withOptions(() => {
  return function ({ addBase, theme }) {
    addBase({
      body: {
        backgroundColor: theme('colors.gray.100'),
        color: theme('colors.gray.800')
      }
    });
  };
});
