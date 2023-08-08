/* eslint-disable import/no-unresolved */
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import clean from '@akrc/esbuild-plugin-clean';
import vitaminTheme from '@websublime/vitamin-theme';
import postcssAutoprefixer from 'autoprefixer';
import { context } from 'esbuild';
import { litCssPlugin } from 'esbuild-plugin-lit-css';
import { outputFile } from 'fs-extra/esm';
import { sync } from 'glob';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import sirv from 'sirv';
import tailwindcss from 'tailwindcss';

import packageJson from './package.json' assert { type: 'json' };

const ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), '../'));
const CORE = resolve(join(ROOT, './core/dist'));
const THEME = resolve(join(ROOT, './theme/dist'));

const processor = (html = false) =>
  postcss([
    postcssImport(),
    postcssNested(),
    html
      ? tailwindcss({
          config: {
            content: ['./www/index.html'],
            plugins: [vitaminTheme()],
            safelist: ['dark', 'light', 'debug'],
            theme: {
              extend: {}
            }
          }
        })
      : tailwindcss({
          config: {
            content: ['./src/**/*.{ts,tsx}'],
            plugins: [vitaminTheme()],
            safelist: ['dark', 'light'],
            theme: {
              extend: {}
            }
          }
        }),
    postcssAutoprefixer()
  ]);

function local() {
  const handlerCore = sirv(CORE, { dev: true, single: true });
  const handlerTheme = sirv(THEME, { dev: true, single: true });

  const serve = createServer(function (request, response) {
    // Set CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    if (request.method === 'OPTIONS') {
      response.writeHead(200);
      response.end();
      return;
    }

    // rome-ignore lint/complexity/useOptionalChain: <explanation>
    if (request.url && request.url.endsWith('icons.mjs')) {
      handlerTheme(request, response);
    } else {
      handlerCore(request, response);
    }
  });

  serve.listen(3000);
}

/** @type {import('esbuild').Plugin} */
function styleTheme() {
  return {
    name: 'style-theme',
    setup(build) {
      build.onStart(async () => {
        const content = await readFile('./src/style.css', 'utf8');
        const { css } = await processor(true).process(content, { from: './src/style.css' });
        await outputFile('./www/assets/style.css', css);
        return console.info('Tailwind style generated.');
      });
    }
  };
}

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

/** type CliOptions = { wacth: boolean; serve: boolean }; */
async function development({ serve = true, watch = true } = {}) {
  const contextBuild = await context({
    define: {
      VERSION: JSON.stringify(packageJson.version)
    },
    entryPoints: [...sync('./src/**/*.ts'), ...sync('./src/elements/**/*.css')],
    format: 'esm',
    logLevel: 'debug',
    outdir: 'www/assets',
    plugins: [
      clean({ dirs: ['www/assets'] }),
      litCssPlugin({
        transform: async (css, { filePath }) => {
          return await processor(false)
            .process(css, { from: filePath })
            .then((result) => {
              return result.css;
            });
        }
      }),
      litCssInJs(),
      styleTheme()
    ],
    sourcemap: true,
    target: 'es2020',
    treeShaking: true
  });

  if (watch) {
    await contextBuild.watch();
  }

  if (serve) {
    local();
    await contextBuild.serve({
      servedir: 'www'
    });
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
development({
  serve: process.argv.includes('--serve'),
  watch: true //process.argv.includes('--watch')
});
