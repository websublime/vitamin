/* eslint-disable unicorn/prefer-module */
/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
// import { fileURLToPath } from 'node:url';

//import convert from 'color-convert';
import { parse } from 'postcss';
import postcssJs from 'postcss-js';
import plugin from 'tailwindcss/plugin.js';

//import { palette } from './colors.js';
import { defineRoot, defineThemes } from './themes.js';

// eslint-disable-next-line max-len
// const currentDirectory = typeof __dirname === undefined ? dirname(fileURLToPath(import.meta.url)) : __dirname;
const currentDirectory = __dirname;
/*const hslToString = ([hue, saturation, lightness]) => `${hue}deg ${saturation}% ${lightness}%`;

const setupTheme = (themeDescriptor) => {
  const base = Object.create(null);
  const { colors, globals } = themeDescriptor;

  for (const [key, value] of Object.entries<string>(colors)) {
    const [red, green, blue] = convert.hex.rgb(value);
    const intense = Math.round((red * 299 + green * 587 + blue * 114) / 1000);

    base[`--${key}-color`] = hslToString(convert.hex.hsl(value));
    base[`--${key}-contrast`] =
      intense <= 180 ? hslToString(convert.hex.hsl('#fff')) : hslToString(convert.hex.hsl('#000'));
  }

  for (const [key, value] of Object.entries(globals)) {
    base[`--${key}`] = value;
  }

  return base;
};*/

export default plugin.withOptions(
  () => {
    return function ({ addBase, addUtilities, config }) {
      const name = config('vitamin.theme.name', 'orizon');
      const globals = config('vitamin.theme.globals', {});
      const colors = config('vitamin.theme.colors', {});

      // eslint-disable-next-line no-console
      console.log('Tailwind Vitamin-Wind Theme:', name);

      const globalsCss = readFileSync(resolve(join(currentDirectory, './css/utilities/globals.css')), 'utf8');
      const globalsResult = postcssJs.objectify(parse(globalsCss));

      const colorsCss = readFileSync(resolve(join(currentDirectory, './css/utilities/colors.css')), 'utf8');
      const colorsResult = postcssJs.objectify(parse(colorsCss));

      const helpersCss = readFileSync(resolve(join(currentDirectory, './css/utilities/helpers.css')), 'utf8');
      const helpersResult = postcssJs.objectify(parse(helpersCss));

      const propertiesCss = readFileSync(resolve(join(currentDirectory, './css/utilities/properties.css')), 'utf8');
      const propertiesResult = postcssJs.objectify(parse(propertiesCss));

      const { base, colors: rootColors, globals: rootGlobals, media, root } = defineRoot({ colors, globals });

      // eslint-disable-next-line unicorn/no-array-reduce
      const defaults = Object.entries({ ...base, ...rootColors, ...rootGlobals, ...root }).reduce(
        (accumulator, [key, value]) => {
          accumulator[`--${key}`] = value;
          return accumulator;
        },
        {}
      );

      const { crimson, gray, indigo, mauve, olive, pink, plum, purple, red, sage, sand, slate, tomato, violet } =
        defineThemes();

      addBase([
        {
          '.dark': {
            '.theme-crimson': crimson?.dark,
            '.theme-gray': gray?.dark,
            '.theme-indigo': indigo?.dark,
            '.theme-mauve': mauve?.dark,
            '.theme-olive': olive?.dark,
            '.theme-pink': pink?.dark,
            '.theme-plum': plum?.dark,
            '.theme-purple': purple?.dark,
            '.theme-red': red?.dark,
            '.theme-sage': sage?.dark,
            '.theme-sand': sand?.dark,
            '.theme-slate': slate?.dark,
            '.theme-tomato': tomato?.dark,
            '.theme-violet': violet?.dark
          },
          '.light': {
            '.theme-crimson': crimson?.light,
            '.theme-gray': gray?.light,
            '.theme-indigo': indigo?.light,
            '.theme-mauve': mauve?.light,
            '.theme-olive': olive?.light,
            '.theme-pink': pink?.light,
            '.theme-plum': plum?.light,
            '.theme-purple': purple?.light,
            '.theme-red': red?.light,
            '.theme-sage': sage?.light,
            '.theme-sand': sand?.light,
            '.theme-slate': slate?.light,
            '.theme-tomato': tomato?.light,
            '.theme-violet': violet?.light
          },
          ':root': {
            ...defaults
          },
          ...media
        },
        { ...globalsResult }
      ]);
      addUtilities([{ ...colorsResult }, { ...helpersResult }, { ...propertiesResult }]);
    };
  },
  function (): any {
    return {
      theme: {
        extend: {}
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
