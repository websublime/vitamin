import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import VuiAlert from './alert.component.vue';

const AlertPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiAlert);
  }
};

export default AlertPlugin;

export {
  VuiAlert
};
