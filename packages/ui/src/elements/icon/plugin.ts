import { defineWebComponent } from '@websublime/vitamin-core/web-component.js';

import { IconElement } from './icon.js';
import type { IconElementOptions } from './types.js';

/**
 * @public
 */
export const registerComponent = (options: IconElementOptions = {}, name = 'ui-icon') =>
  defineWebComponent(name, IconElement, {
    className: ['ui-icon'],
    enabled: false,
    ...options
  });
