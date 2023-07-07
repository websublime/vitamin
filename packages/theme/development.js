/* eslint-disable unicorn/prefer-module */
// eslint-disable-next-line import/no-unresolved
const clean = require('@akrc/esbuild-plugin-clean');
const postCssPlugin = require('@deanc/esbuild-plugin-postcss');
const { context } = require('esbuild');
const { sync } = require('glob');

const packageJson = require('./package.json');

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function development({ serve = true, watch = true } = {}) {
  const contextBuild = await context({
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: ['./src/index.css'],
    format: 'cjs',
    logLevel: 'debug',
    outdir: 'www/assets',
    plugins: [
      clean({ dirs: ['www/assets'] }),
      postCssPlugin({
        plugins: [
          require('tailwindcss')({ config: './tailwind.config.js' }),
          require('postcss-nested'),
          require('autoprefixer')
        ]
      })
    ],
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
