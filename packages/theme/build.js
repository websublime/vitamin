/* eslint-disable unicorn/prefer-module */
// eslint-disable-next-line import/no-unresolved
const clean = require('@akrc/esbuild-plugin-clean');
const postCssPlugin = require('@deanc/esbuild-plugin-postcss');
const { context } = require('esbuild');
//const { sync } = require('glob');

const packageJson = require('./package.json');

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
    plugins: [clean()],
    sourcemap: true,
    target: 'es2020',
    treeShaking: true
  });

  await contextBuild.rebuild();
  await contextBuild.dispose();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
build();
