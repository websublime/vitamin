import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import VuiButton from './button.component.vue';

const ButtonPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiButton);
  }
};

export default ButtonPlugin;

export {
  VuiButton
};
