import { defineWebComponent } from '@websublime/vitamin-core/web-component.js';

import { LimiterElement } from './limiter.js';
import type { LimiterElementOptions } from './types.js';

/**
 * @public
 */
export const registerComponent = (options: LimiterElementOptions = {}, name = 'ui-limiter') =>
  defineWebComponent(name, LimiterElement, {
    className: ['ui-limiter'],
    enabled: false,
    ...options
  });
