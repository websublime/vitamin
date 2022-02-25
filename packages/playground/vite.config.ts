import vue from '@vitejs/plugin-vue';
import { join, resolve } from 'path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import vitePluginVuedoc, { vueDocFiles } from 'vite-plugin-vuedoc';

const root = resolve(__dirname);
const { CI = false } = process.env;

// eslint-disable-next-line no-console
console.log('ROOT: ', root);
// eslint-disable-next-line no-console
console.log('IsCI: ', CI);

// https://vitejs.dev/config/
export default defineConfig({
  base: CI ? '/vitamin/' : '/',
  plugins: [vitePluginVuedoc({
    highlight: {
      theme: 'one-dark'
    },
    previewClass: 'vitamin-preview my-8',
    wrapperClass: 'vitamin-wrap'
  }), vue({
    include: [...vueDocFiles]
  })],
  resolve: {
    alias: [
      {
        find: '@websublime/vitamin-ui',
        replacement: resolve(join(root, '../ui/src/index.ts'))
      },
      {
        find: '@',
        replacement: resolve(join(root, './src'))
      }
    ]
  },
  root,
  server: {
    force: true,
    fs: {
      allow: [searchForWorkspaceRoot(resolve(join(root, '../')))]
    }
  }
});
