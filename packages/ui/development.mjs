import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line import/no-unresolved
import clean from '@akrc/esbuild-plugin-clean';
import postcssAutoprefixer from 'autoprefixer';
import { context } from 'esbuild';
import { litCssPlugin } from 'esbuild-plugin-lit-css';
import postCssPlugin from 'esbuild-postcss';
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

const processor = postcss([
  postcssImport(),
  postcssNested(),
  tailwindcss({ config: './tailwind.config.cjs' }),
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

async function style() {
  const contextBuild = await context({
    entryPoints: ['./src/style.css'],
    format: 'esm',
    logLevel: 'debug',
    outdir: 'www/assets',
    plugins: [postCssPlugin()]
  });

  await contextBuild.watch();
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
          return await processor.process(css, { from: filePath }).then((result) => {
            return result.css;
          });
        }
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
    local();
    await contextBuild.serve({
      servedir: 'www'
    });
  }
}

function buildDevelopment() {
  style();
  development({
    serve: process.argv.includes('--serve'),
    watch: true //process.argv.includes('--watch')
  });
}

buildDevelopment();
