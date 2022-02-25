/* eslint-disable no-console */
import './style.css';

import codicon from '@iconify/json/json/codicon.json';
import { Vitamin } from '@websublime/vitamin-ui';
import { createApp } from 'vue';

import App from '@/App.vue';
import { RootAttrs } from '@/types/application';

boot(init());

function init(): RootAttrs {
  const isMediaDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const colorScheme = localStorage.getItem('color-scheme') || (isMediaDark ? 'dark' : 'light');

  const isDark = colorScheme === 'dark';

  return {
    colorScheme,
    dark: isDark,
    suspense: true
  };
}

async function boot(options: RootAttrs) {
  const app = createApp(App);

  app.use(Vitamin, {
    iconifyPack: codicon,
    iconifyPrefix: 'codicon'
  });

  app.config.globalProperties = {
    ...app.config.globalProperties,
    options
    // Vitamin config props here
  };

  app.mount('#app');

  console.group('APPLICATION VUE');
  console.dir(app);
  console.groupEnd();
}
