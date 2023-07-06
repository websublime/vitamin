import convert from 'color-convert';
import { withOptions } from 'tailwindcss/plugin.js';

import { palette } from './colors.js';
import { theme as themes } from './themes.js';

const hslToString = ([hue, saturation, lightness]) => `${hue}deg ${saturation}% ${lightness}%`;

const setupTheme = (themeDescriptor) => {
  const base = Object.create(null);
  const { colors, globals } = themeDescriptor;

  for (const [key, value] of Object.entries(colors)) {
    const [red, green, blue] = convert.hex.rgb(value);
    const intense = Math.round(
      (Number.parseInt(red) * 299 + Number.parseInt(green) * 587 + Number.parseInt(blue) * 114) / 1000
    );

    base[`--${key}-color`] = hslToString(convert.hex.hsl(value));
    base[`--${key}-contrast`] =
      intense <= 180 ? hslToString(convert.hex.hsl('#fff')) : hslToString(convert.hex.hsl('#000'));
  }

  for (const [key, value] of Object.entries(globals)) {
    base[`--${key}`] = value;
  }

  return base;
};

export default withOptions(
  () => {
    return function ({ addBase, config }) {
      const themer = config('vitamin.theme.name', 'orizon');
      const globals = config('vitamin.theme.globals', {});
      const colored = config('vitamin.theme.colors', {});

      // eslint-disable-next-line no-console
      console.log('Tailwind Vitamin-Wind Theme:', themer);

      const bootTheme = themes[themer];

      const defaults = setupTheme(bootTheme({ colors: colored, globals }));

      addBase({ [`[theme=${themer}]`]: defaults });
    };
  },
  function (): any {
    return {
      theme: {
        extend: {
          colors: palette
        }
      },
      vitamin: {
        theme: {
          colors: {},
          globals: {},
          name: 'orizon'
        }
      }
    };
  }
);
