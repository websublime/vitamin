import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import VuiCard from './card.component.vue';

const CardPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiCard);
  }
};

export default CardPlugin;

export {
  VuiCard
};
