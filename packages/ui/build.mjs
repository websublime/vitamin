import { readFile } from 'node:fs/promises';

// eslint-disable-next-line import/no-unresolved
import clean from '@akrc/esbuild-plugin-clean';
import vitaminTheme from '@websublime/vitamin-theme';
// eslint-disable-next-line import/no-unresolved
import postcssAutoprefixer from 'autoprefixer';
import { context } from 'esbuild';
import { litCssPlugin } from 'esbuild-plugin-lit-css';
import { sync } from 'glob';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import tailwindcss from 'tailwindcss';

import packageJson from './package.json' assert { type: 'json' };

const processor = postcss([
  postcssImport(),
  postcssNested(),
  tailwindcss({
    config: {
      content: ['./src/**/*.{ts,tsx}'],
      plugins: [vitaminTheme()],
      theme: {
        extend: {}
      }
    }
  }),
  postcssAutoprefixer()
]);

/** @type {import('esbuild').Plugin} */
function litCssInJs() {
  return {
    name: 'lit-css-to-js',
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (parameters) => {
        const content = await readFile(parameters.path, 'utf8');
        const contents = content.replaceAll('.css', '.js');

        return { contents, loader: 'ts' };
      });
    }
  };
}

export async function build({ watch = false } = {}) {
  const contextBuild = await context({
    bundle: false,
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: [
      './src/index.ts',
      './src/browser.ts',
      './src/version.ts',
      ...sync('./src/elements/**/*.ts'),
      ...sync('./src/elements/**/*.css')
    ],
    format: 'esm',
    logLevel: 'debug',
    minify: true,
    outExtension: { '.js': '.js' },
    outbase: 'src',
    outdir: './dist',
    plugins: [
      clean(),
      litCssPlugin({
        transform: async (css, { filePath }) => {
          return await processor.process(css, { from: filePath }).then((result) => {
            return result.css;
          });
        }
      }),
      litCssInJs()
    ],
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
