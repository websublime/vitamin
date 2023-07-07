/* eslint-disable unicorn/prefer-module */
import { join, resolve } from 'node:path';

import convert from 'color-convert';
import { readFileSync } from 'fs-extra';
import { parse } from 'postcss';
import postcssJs from 'postcss-js';
import { withOptions } from 'tailwindcss/plugin.js';

import { palette } from './colors.js';
import { defineTheme } from './themes.js';

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
    return function ({ addBase, addUtilities, config }) {
      const name = config('vitamin.theme.name', 'orizon');
      const globals = config('vitamin.theme.globals', {});
      const colored = config('vitamin.theme.colors', {});

      // eslint-disable-next-line no-console
      console.log('Tailwind Vitamin-Wind Theme:', name);

      const globalsCss = readFileSync(resolve(join(__dirname, './css/utilities/globals.css')), 'utf8');
      const globalsResult = postcssJs.objectify(parse(globalsCss));

      const colorsCss = readFileSync(resolve(join(__dirname, './css/utilities/colors.css')), 'utf8');
      const colorsResult = postcssJs.objectify(parse(colorsCss));

      const helpersCss = readFileSync(resolve(join(__dirname, './css/utilities/helpers.css')), 'utf8');
      const helpersResult = postcssJs.objectify(parse(helpersCss));

      const propertiesCss = readFileSync(resolve(join(__dirname, './css/utilities/properties.css')), 'utf8');
      const propertiesResult = postcssJs.objectify(parse(propertiesCss));

      const defaults = setupTheme(defineTheme({ colors: colored, globals }));

      addBase([{ [`[theme=${name}]`]: defaults }, { ...globalsResult }]);
      addUtilities([{ ...colorsResult }, { ...helpersResult }, { ...propertiesResult }]);
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
