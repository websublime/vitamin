import { defineWebComponent } from '@websublime/vitamin-core/web-component.js';

import { SwitchElement } from './switch.js';
import type { SwitchElementOptions } from './types.js';

/**
 * @public
 */
export const registerComponent = (options: SwitchElementOptions = {}, name = 'ui-switch') =>
  defineWebComponent(name, SwitchElement, {
    className: ['ui-switch'],
    enabled: false,
    ...options
  });
