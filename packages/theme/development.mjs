import { createRequire } from 'node:module';

// eslint-disable-next-line import/no-unresolved
import clean from '@akrc/esbuild-plugin-clean';
import { context } from 'esbuild';
import postCssPlugin from 'esbuild-postcss';
import { sync } from 'glob';

import packageJson from './package.json' assert { type: 'json' };

const require = createRequire(import.meta.url);

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function development({ serve = true, watch = true } = {}) {
  const contextBuild = await context({
    bundle: true,
    chunkNames: 'style',
    entryNames: 'style',
    entryPoints: {
      style: './src/style.css'
    },
    logLevel: 'debug',
    outdir: 'www/assets',
    plugins: [clean({ dirs: ['www/assets'] }), postCssPlugin()],
    sourcemap: false
  });

  if (watch) {
    await contextBuild.watch();
  }

  if (serve) {
    await contextBuild.serve({
      servedir: 'www'
    });
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
development({
  serve: process.argv.includes('--watch'),
  watch: process.argv.includes('--watch')
});