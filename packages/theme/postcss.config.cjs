const customMedia = require('postcss-custom-media');
const postcssImport = require('postcss-import');
const postcssMixins = require('postcss-mixins');
const postcssNested = require('postcss-nested');
const postcssPresetEnv = require('postcss-preset-env');
const postcssSimpleVars = require('postcss-simple-vars');

module.exports = {
  plugins: [
    postcssImport(),
    postcssMixins(),
    postcssSimpleVars(),
    postcssNested(),
    postcssPresetEnv({
      autoprefixer: false,
      features: {
        'color-functional-notation': false,
        'custom-media-queries': { preserve: true },
        'custom-properties': false,
        'double-position-gradients': false,
        'focus-visible-pseudo-class': false,
        'focus-within-pseudo-class': false,
        'gap-properties': false,
        'logical-properties-and-values': false,
        'not-pseudo-class': false,
        'place-properties': false,
        'prefers-color-scheme-query': false
      },
      stage: 0
    }),
    customMedia()
  ]
};
