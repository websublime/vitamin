import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
// import { useLoading, useLoadingContext } from './context';
import VuiIcon from './icon.component.vue';

const IconPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiIcon);
  }
};

export default IconPlugin;

export {
  VuiIcon
};
