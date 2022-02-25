import { App } from 'vue';

import * as components from './components';
import { getOptions, Programmatic, setOptions, setVueInstance } from './utils/config';
import { merge } from './utils/helpers';
import { registerComponentProgrammatic, registerPlugin } from './utils/plugins';

export const Vitamin = {
  install(app: App, options = {}): void {
    setVueInstance(app);

    const defaultConfig = getOptions();

    setOptions(merge(defaultConfig, options));

    Object.keys(components).forEach(key => registerPlugin(app, components[key]));

    registerComponentProgrammatic(app, 'config', Programmatic);
  }
};

export * from './components';
