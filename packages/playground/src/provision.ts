import codicon from '@iconify/json/json/codicon.json';
import Vitamin from '@vitamin/ui';
import { App } from '@vue/runtime-core';
import { createRouter, createWebHistory } from 'vue-router';

import DocMain from './components/DocMain.vue';
import demos from './routing';

const routes: any = [
  { path: '/', redirect: '/doc/intro' },
  {
    children: demos,
    component: DocMain,
    path: '/doc'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export function setup(app: App): void {
  app.use(router);
  app.use(Vitamin, {
    iconifyPack: codicon,
    iconifyPrefix: 'codicon'
  });
}
