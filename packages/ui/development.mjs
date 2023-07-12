// eslint-disable-next-line import/no-unresolved
import clean from '@akrc/esbuild-plugin-clean';
import { context } from 'esbuild';
import postCssPlugin from 'esbuild-postcss';
import { sync } from 'glob';

import packageJson from './package.json' assert { type: 'json' };

function httpResolver() {
  /** @type {import('esbuild').Plugin} */
  return {
    name: 'httpResolver',
    setup: (build) => {
      console.log(build);

      build.onResolve({ filter: /^@websublime\/.+/ }, (parameters) => {
        console.log(parameters);
        debugger;
        return {
          namespace: 'http-resolver',
          path: parameters.path
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'http-resolver' }, async (parameters) => {
        console.log(parameters);
        debugger;
        return {
          contents: `export default ${JSON.stringify(parameters.path)}`
        };
      });
    }
  };
}

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
    plugins: [httpResolver(), clean({ dirs: ['www/js'] }), postCssPlugin()],
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
  serve: true, //process.argv.includes('--serve'),
  watch: false //process.argv.includes('--watch')
});
