import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import vitePluginVuedoc, { vueDocFiles } from 'vite-plugin-vuedoc';

const root = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginVuedoc({
      highlight: {
        theme: 'one-dark'
      },
      wrapperClass: 'vitamin-preview'
    }),
    vue({
      include: [...vueDocFiles]
    })
  ],
  root,
  server: {
    force: true
  }
});
