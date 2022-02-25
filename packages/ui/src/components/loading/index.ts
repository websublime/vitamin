import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import { useLoading, useLoadingContext } from './context';
import VuiLoading from './loading.component.vue';

const LoadingPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiLoading);
  }
};

export default LoadingPlugin;

export {
  useLoading,
  useLoadingContext,
  VuiLoading
};
