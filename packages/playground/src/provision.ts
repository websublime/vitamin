import carbon from '@iconify/json/json/carbon.json';
import codicon from '@iconify/json/json/codicon.json';
import { addCollection } from '@iconify/vue';
import { App } from '@vue/runtime-core';
import Vitamin from '@websublime/vitamin-ui';
import { createRouter, createWebHistory } from 'vue-router';

import DocMain from './components/DocMain.vue';
import demos from './routing';

addCollection(codicon);
addCollection(carbon);

const routes: any = [
  { path: '/', redirect: '/doc/intro' },
  {
    children: demos,
    component: DocMain,
    path: '/doc'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export function setup(app: App): void {
  app.use(router);
  app.use(Vitamin, {
    iconifyPack: codicon,
    iconifyPrefix: 'codicon'
  });
}
