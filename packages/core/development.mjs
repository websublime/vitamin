// eslint-disable-next-line import/no-unresolved
import clean from '@akrc/esbuild-plugin-clean';
import { context } from 'esbuild';
import { sync } from 'glob';

import packageJson from './package.json' assert { type: 'json' };

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function development({ serve = true, watch = true } = {}) {
  const contextBuild = await context({
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: [...sync('./src/**/*.ts')],
    format: 'esm',
    logLevel: 'debug',
    outdir: 'www/js',
    plugins: [clean({ dirs: ['www/js'] })],
    sourcemap: true,
    target: 'es2020',
    treeShaking: true
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
