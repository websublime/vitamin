/* eslint-disable no-console */
import { registerComponent as registCheckboxComponent } from './elements/checkbox/plugin.js';
import { registerComponent as registIconComponent } from './elements/icon/plugin.js';
import { registerComponent as registLimiterComponent } from './elements/limiter/plugin.js';
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
  registLimiterComponent();
}

function defineListeners() {
  defineElementListener('ui-checkbox');
  defineElementListener('ui-switch');
  defineElementListener('ui-range');
  defineElementListener('ui-limiter');
}

function boot() {
  defineComponents();
  defineListeners();
  handleTheme();
}

boot();

function handleTheme() {
  const root = document.querySelector(':root');

  document.querySelector('#theme-change')?.addEventListener('change', (event: any) => {
    if (event.detail) {
      root?.classList.remove('dark');
      root?.classList.add('light');
    } else {
      root?.classList.remove('light');
      root?.classList.add('dark');
    }
  });
}
