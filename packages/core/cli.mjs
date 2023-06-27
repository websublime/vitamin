import { context } from 'esbuild';
import { sync } from 'glob';

import packageJson from './package.json' assert { type: 'json' };

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function development({ serve = true, watch = true } = {}) {
  const contextBuild = await context({
    bundle: true,
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: [...sync('./src/**/*.ts')],
    format: 'esm',
    logLevel: 'debug',
    outdir: 'www/js',
    target: 'es2020'
  });

  if (watch) {
    contextBuild.watch();
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