import { WebComponentOptions } from '@websublime/vitamin-core';
import { defineWebComponent } from '@websublime/vitamin-core/web-component.js';

import { IconElement } from './icon.js';

interface IconElementOptions extends WebComponentOptions {
  className?: string[];
  enabled?: boolean;
}

/**
 * @public
 */
export const registerComponent = (options: IconElementOptions = {}, name = 'ui-icon') =>
  defineWebComponent(name, IconElement, {
    className: ['ui-icon'],
    enabled: false,
    ...options
  });

declare global {
  interface HTMLElementTagNameMap {
    'ui-icon': IconElement;
  }
}
