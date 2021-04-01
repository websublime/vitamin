import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import vitePluginVuedoc, { vueDocFiles } from 'vite-plugin-vuedoc';

const root = resolve(__dirname);
const { CI = false } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  base: CI ? 'vitamin/' : '/',
  plugins: [vitePluginVuedoc({
    highlight: {
      theme: 'one-dark'
    },
    previewClass: 'vitamin-preview my-8',
    wrapperClass: 'vitamin-wrap'
  }), vue({
    include: [...vueDocFiles]
  })],
  root,
  server: {
    force: true
  }
});
