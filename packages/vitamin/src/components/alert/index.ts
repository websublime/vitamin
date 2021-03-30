import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import Alert from './alert.component.vue';

const AlertPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, Alert);
  }
};

export default AlertPlugin;

export {
  Alert as HuiAlert
};
