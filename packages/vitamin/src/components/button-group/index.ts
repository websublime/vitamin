import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import VuiButtonGroup from './button-group.component.vue';

const ButtonGroupPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiButtonGroup);
  }
};

export default ButtonGroupPlugin;

export {
  VuiButtonGroup
};
