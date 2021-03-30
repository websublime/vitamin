import '@vitamin/ui/dist/theme.css';
import 'vite-plugin-vuedoc/style.css';

import { createApp } from 'vue';

import App from './App.vue';
import { setup } from './provision';

async function boot() {
  const app = createApp(App);

  setup(app);

  app.mount('#app');

  return app;
}

boot();
