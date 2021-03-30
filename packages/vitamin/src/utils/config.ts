import { App } from 'vue';

import { merge } from './helpers';

let config = {
  iconPack: 'mdi',
  statusIcon: true,
  useHtml5Validation: true
};

export const setOptions = (options: any): void => { config = options; };

export const getOptions = () => config;

export let VueInstance: App;

export const setVueInstance = (Vue: App) => { VueInstance = Vue; };

export const Programmatic = {
  getOptions,
  setOptions(options: any): void {
    setOptions(merge(getOptions(), options, true));
  }
};

export const Plugin = {
  install(Vue: App, options = {}): void {
    setVueInstance(Vue);
    // Options
    setOptions(merge(getOptions(), options, true));
  }
};
