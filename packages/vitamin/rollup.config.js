import babel from '@rollup/plugin-babel';
import cjs from '@rollup/plugin-commonjs';
import node from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';

// eslint-disable-next-line import/extensions
import pack from './package.json';

const bannerTxt = `/*! Vitamin v${pack.version} | MIT License | github.com/websublime/vitamin */\n`;

const baseFolder = './src/components/';

const components = fs
  .readdirSync(baseFolder)
  .filter((file) =>
    fs.statSync(path.join(baseFolder, file)).isDirectory()
  );

const entries = {
  'config': './src/utils/config.ts',
  'helpers': './src/utils/helpers.ts',
  'index': './src/index.ts',
  ...components.reduce((obj, name) => {
    obj[name] = (baseFolder + name);
    return obj;
  }, {})
};

const babelOptions = {
  babelHelpers: 'bundled'
};

const vuePluginConfig = {
  template: {
    compilerOptions: {
      whitespace: 'condense'
    },
    isProduction: true
  }
};

const capitalize = (string) => {
  if (typeof string !== 'string') {return '';}
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default () => {
  let config = [
    {
      external: ['vue'],
      input: entries,
      output: {
        dir: 'dist/esm',
        format: 'esm'
      },
      plugins: [
        node({ extensions: ['.vue', '.ts']}),
        typescript({ typescript: require('typescript')}),
        vue(vuePluginConfig),
        babel(babelOptions),
        cjs()
      ]
    },
    {
      external: ['vue'],
      input: entries,
      output: {
        dir: 'dist/cjs',
        exports: 'named',
        format: 'cjs'
      },
      plugins: [
        node({ extensions: ['.vue', '.ts']}),
        typescript({ typescript: require('typescript')}),
        vue(vuePluginConfig),
        babel(babelOptions),
        cjs()
      ]
    },
    {
      external: ['vue'],
      input: 'src/index.ts',
      output: {
        banner: bannerTxt,
        exports: 'named',
        file: 'dist/vitamin.js',
        format: 'umd',
        globals: {
          vue: 'Vue'
        },
        name: capitalize('vitamin')
      },
      plugins: [
        node({ extensions: ['.vue', '.ts']}),
        typescript({ typescript: require('typescript')}),
        vue(vuePluginConfig),
        babel(babelOptions),
        cjs()
      ]
    },
    {
      external: ['vue'],
      input: 'src/index.ts',
      output: {
        banner: bannerTxt,
        file: 'dist/vitamin.esm.js',
        format: 'esm'
      },
      plugins: [
        node({extensions: ['.vue', '.ts']}),
        typescript({ typescript: require('typescript')}),
        vue(vuePluginConfig),
        babel(babelOptions),
        cjs()
      ]
    }
  ];

  if (process.env.MINIFY === 'true') {
    config = config.filter((conf) => !!conf.output.file);

    config.forEach((conf) => {
      conf.output.file = conf.output.file.replace(/\.js/g, '.min.js');
      conf.plugins.push(terser({
        output: {
          comments: '/^!/'
        }
      }));
    });
  }
  return config;
};
