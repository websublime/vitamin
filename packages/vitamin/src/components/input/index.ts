import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import VuiInput from './input.component.vue';

const InputPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiInput);
  }
};

export default InputPlugin;

export {
  VuiInput
};
