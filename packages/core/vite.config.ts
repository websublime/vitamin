import { extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import replace from '@rollup/plugin-replace';
import { glob } from 'glob';
import { defineConfig } from 'vite';

import packageJson from './package.json' assert { type: 'json' };

const files = glob.sync('./src/**/*.{ts,js}', { ignore: ['src/main.ts', 'src/types/**'] }).map((file) => {
  return [
    // 1. The name of the entry point
    // lib/nested/foo.js becomes nested/foo
    relative('src', file.slice(0, file.length - extname(file).length)),
    // 2. The absolute path to the entry file
    // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
    fileURLToPath(new URL(file, import.meta.url))
  ];
});

export default defineConfig({
  build: {
    lib: {
      entry: Object.fromEntries(files),
      formats: ['es']
    },
    minify: true,
    outDir: 'dist',
    rollupOptions: {
      external: ['lit'],
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'chunks/[name].js',
        entryFileNames: '[name].js'
      },
      treeshake: true
    }
  },
  define: {
    // eslint-disable-next-line prettier/prettier
    'BUILD_VERSION': JSON.stringify(packageJson.version)
  }
});
