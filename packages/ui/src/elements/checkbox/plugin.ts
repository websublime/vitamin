import { defineWebComponent } from '@websublime/vitamin-core/web-component.js';

import { CheckboxElement } from './checkbox.js';
import type { CheckboxElementOptions } from './types.js';

/**
 * @public
 */
export const registerComponent = (options: CheckboxElementOptions = {}, name = 'ui-checkbox') =>
  defineWebComponent(name, CheckboxElement, {
    className: ['ui-checkbox'],
    enabled: false,
    ...options
  });
