import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { context } from 'esbuild';
import { copy } from 'fs-extra';

import packageJson from './package.json' assert { type: 'json' };

async function copyStyles() {
  const source = resolve(join(dirname(fileURLToPath(import.meta.url)), './src/css'));

  const destiny = resolve(join(dirname(fileURLToPath(import.meta.url)), './dist/css'));

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
    format: 'esm',
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
