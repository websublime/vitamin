/* eslint-disable unicorn/prefer-module */
// eslint-disable-next-line import/no-unresolved
const { join, resolve } = require('node:path');

const postCssPlugin = require('@deanc/esbuild-plugin-postcss');
const { context } = require('esbuild');
//const { sync } = require('glob');
const { copy } = require('fs-extra');

const packageJson = require('./package.json');

async function copyStyles() {
  const source = resolve(join(__dirname, './src/css'));

  const destiny = resolve(join(__dirname, './dist/css'));

  copy(source, destiny, { recursive: true });
}

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function build() {
  const contextBuild = await context({
    bundle: false,
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: ['./src/index.ts', './src/version.ts', './src/themes.ts', './src/colors.ts'],
    format: 'cjs',
    logLevel: 'debug',
    minify: true,
    outExtension: { '.js': '.js' },
    outbase: 'src',
    outdir: './dist',
    platform: 'node',
    plugins: [],
    sourcemap: true,
    target: 'es2020',
    treeShaking: true
  });

  await contextBuild.rebuild();
  await contextBuild.dispose();
}

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function buildIcons() {
  const contextBuild = await context({
    bundle: false,
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: ['./src/icons.ts'],
    format: 'esm',
    logLevel: 'debug',
    minify: true,
    outExtension: { '.js': '.mjs' },
    outbase: 'src',
    outdir: './dist',
    platform: 'browser',
    plugins: [],
    sourcemap: true,
    target: 'es2020',
    treeShaking: true
  });

  await contextBuild.rebuild();
  await contextBuild.dispose();
}

async function buildBundle() {
  await build();
  await buildIcons();
  await copyStyles();
  //await copyTheme();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
buildBundle();
