/* eslint-disable no-console */
import { registerComponent as registCheckboxComponent } from './elements/checkbox/plugin.js';
import { registerComponent as registIconComponent } from './elements/icon/plugin.js';
import { registerComponent as registRangeComponent } from './elements/range/plugin.js';
import { registerComponent as registSwitchComponent } from './elements/switch/plugin.js';

function defineElementListener(name: string, type = 'change') {
  for (const element of document.querySelectorAll(name)) {
    element.addEventListener(type, (event) => {
      console.dir({ [name]: event });
    });
  }
}

function defineComponents() {
  registIconComponent();
  registSwitchComponent();
  registCheckboxComponent();
  registRangeComponent();
}

function defineListeners() {
  defineElementListener('ui-checkbox');
  defineElementListener('ui-switch');
  defineElementListener('ui-range');
}

function boot() {
  defineComponents();
  defineListeners();
}

boot();
