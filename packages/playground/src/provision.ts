import carbon from '@iconify/json/json/carbon.json';
import codicon from '@iconify/json/json/codicon.json';
import { addCollection } from '@iconify/vue';
import { App } from '@vue/runtime-core';
import Vitamin from '@websublime/vitamin-ui';

import { ApplicationContext, provideApplicationContext } from './api/context/application.context';
import { router } from './routing';

addCollection(codicon);
addCollection(carbon);

export function setup(app: App): void {
  app.provide(ApplicationContext, provideApplicationContext());

  app.use(router);

  app.use(Vitamin, {
    iconifyPack: codicon,
    iconifyPrefix: 'codicon'
  });
}
