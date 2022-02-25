/* eslint-disable @typescript-eslint/no-var-requires */
const plugin = require('tailwindcss/plugin');
const convert = require('color-convert');

const colors = require('./src/colors');
const themes = require('./src/themes');

const hslToString = ([hue, saturation, lightness]) => `${hue}deg ${saturation}% ${lightness}%`;

/** @type { import("tailwindcss/plugin") } */
module.exports = plugin(({ addBase, config, ...rest }) => {
  const themer = config('vitamin.theme.name', 'orizon');
  const globals = config('vitamin.theme.globals', {});
  const colored = config('vitamin.theme.colors', {});

  // eslint-disable-next-line no-console
  console.log('Tailwind Vitamin-Wind Theme: ', themer);

  const bootTheme = themes[themer];

  const setupTheme = (themeDescriptor) => {
    const base = Object.create(null);
    const { colors, globals } = themeDescriptor;

    Object.entries(colors).forEach(([key, value]) => {
      const [red, green, blue] = convert.hex.rgb(value);
      const intense = Math.round(((parseInt(red) * 299) + (parseInt(green) * 587) + (parseInt(blue) * 114)) / 1000);

      base[`--${key}-color`] = hslToString(convert.hex.hsl(value));
      base[`--${key}-contrast`] = intense <= 180 ? hslToString(convert.hex.hsl('#fff')) : hslToString(convert.hex.hsl('#000'));
    });

    Object.entries(globals).forEach(([key, value]) => {
      base[`--${key}`] = value;
    });

    return base;
  };

  const defaults = setupTheme(bootTheme({ colors: colored, globals}));

  addBase({ [`[theme=${themer}]`]: defaults });
}, {
  theme: {
    extend: {
      colors
    }
  },
  vitamin : {
    theme: {
      colors: {},
      globals: {},
      name: 'orizon'
    }
  }
});
