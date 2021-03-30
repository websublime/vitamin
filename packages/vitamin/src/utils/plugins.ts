/* eslint-disable id-match */
import { App, DefineComponent, Plugin } from 'vue';

export const registerPlugin = (app: App, plugin: Plugin): void => {
  app.use(plugin);
};

export const registerComponent = (app: App, component: DefineComponent): void => {
  app.component(component.name, component);
};

export const registerComponentProgrammatic = (app: App, property: string, component: any): void => {
  if (!app.config.globalProperties.$vitamin) {
    app.config.globalProperties.$vitamin = {};
  }

  app.config.globalProperties.$vitamin[property] = component;
};
