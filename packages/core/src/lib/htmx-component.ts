/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import type { ComponentMetadata, WebComponentOptions } from '../types/component';
import { Constructor } from '../types/general';

import { ComponentElement } from './web-component';

export class ComponentHtmx extends ComponentElement<WebComponentOptions> {
  constructor(registry: ComponentMetadata) {
    super(registry);
  }
}

/**
 * Register a custom element Lit class component. This function will
 * also add the component options to the prototype.
 *
 * @public
 */
export function defineHtmxComponent<ComponentHtmx extends ComponentElement>(
  name: string,
  component: Constructor<ComponentHtmx>,
  options: WebComponentOptions = {}
): Constructor<ComponentHtmx> {
  Object.defineProperty(component.prototype, 'componentOptions', {
    enumerable: true,
    value: options,
    writable: true
  });

  if (!window.customElements.get(name)) {
    window.customElements.define(name, component);
  }

  return component;
}
