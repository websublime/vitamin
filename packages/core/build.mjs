// eslint-disable-next-line import/no-unresolved
import clean from '@akrc/esbuild-plugin-clean';
import { context } from 'esbuild';
import { litCssPlugin } from 'esbuild-plugin-lit-css';
import { sync } from 'glob';

import packageJson from './package.json' assert { type: 'json' };

export async function build({ watch = false } = {}) {
  const contextBuild = await context({
    bundle: false,
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: ['./src/index.ts', './src/version.ts', ...sync('./src/utilities/*.ts')],
    format: 'esm',
    logLevel: 'debug',
    outExtension: { '.js': '.mjs' },
    outbase: 'src',
    outdir: './dist',
    plugins: [clean(), litCssPlugin()],
    sourcemap: true,
    target: 'es2020',
    treeShaking: true
  });

  if (watch) {
    contextBuild.watch();
  } else {
    await contextBuild.rebuild();
    await contextBuild.dispose();
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
build({ watch: process.argv.includes('--watch') });
