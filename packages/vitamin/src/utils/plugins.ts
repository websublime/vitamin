/* eslint-disable id-match */
/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { App, Plugin } from 'vue';

export const registerPlugin = (app: App, plugin: Plugin): void => {
  app.use(plugin);
};

export const registerComponent = (app: App, component: any): void => {
  app.component(component.name, component);
};

export const registerComponentProgrammatic = (app: App, property: string, component: any): void => {
  if (!app.config.globalProperties.$vitamin) {
    app.config.globalProperties.$vitamin = {};
  }

  app.config.globalProperties.$vitamin[property] = component;
};
