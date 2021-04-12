import './theme/style.css';

import { createApp } from 'vue';

import Application from '@/modules/application/app.container';

import { setup } from './provision';

async function boot() {
  const app = createApp(Application);

  setup(app);

  app.mount('#app');

  return app;
}

boot();
