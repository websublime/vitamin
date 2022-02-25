const { build } = require('esbuild');
const { dependencies } = require('../package.json');
const { copy } = require('fs-extra');
const { join, resolve } = require('path');

const external = Object.entries(dependencies).map(([key]) => key);

async function copyStyles() {
  const src = resolve(join(__dirname, '../src/css'));

  const destiny = resolve(join(__dirname, '../dist'));

  copy(src, destiny, { recursive: true });
}

async function copyTheme() {
  const src = resolve(join(__dirname, '../src/theme'));

  const destiny = resolve(join(__dirname, '../dist/theme'));

  copy(src, destiny, { recursive: true });
}

async function buildCli() {
  return build({
    bundle: true,
    entryPoints: ['./index.ts'],
    external: [...external, 'esbuild'],
    outbase: 'src',
    outfile: 'dist/theme-vitamin-plugin.js',
    platform: 'node',
    target: ['node12'],
    write: true
  });
}

async function buildBundle() {
  await buildCli();
  await copyStyles();
  await copyTheme();
}

buildBundle();
