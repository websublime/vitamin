import { defineWebComponent } from '@websublime/vitamin-core/web-component.js';

import { RangeElement } from './range.js';
import type { RangeElementOptions } from './types.js';

/**
 * @public
 */
export const registerComponent = (options: RangeElementOptions = {}, name = 'ui-range') =>
  defineWebComponent(name, RangeElement, {
    className: ['ui-range'],
    enabled: false,
    ...options
  });
