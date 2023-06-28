/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import { LitElement, ReactiveElement } from 'lit';

import { ComponentMetadata, ComponentMixinInterface, Constructor, WebComponentOptions } from '../types/index.js';

import { property } from './decorators.js';

/**
 * @public
 */
export function ComponentMixin<T extends Constructor<ReactiveElement>>(
  // rome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  constructor: T
): T & Constructor<ComponentMixinInterface> {
  class SuperElement extends constructor {
    readonly settings!: WebComponentOptions;

    protected _options!: WebComponentOptions;

    set options(options: WebComponentOptions) {
      const oldValue = {
        ...this.settings,
        ...this._options
      };

      this._options = {
        ...this.settings,
        ...options
      };

      this.requestUpdate('options', oldValue);
    }

    /**
     * @public
     */
    @property({ type: Object })
    get options() {
      return this._options ?? this.settings;
    }

    /**
     * @public
     */
    @property({ reflect: true })
    public dir: 'ltr' | 'rtl' = 'ltr';

    /**
     * @public
     */
    @property({ reflect: true, type: Boolean })
    public inspect = false;

    /**
     * @public
     */
    public get isLTR(): boolean {
      return this.dir === 'ltr';
    }

    public override connectedCallback(): void {
      super.connectedCallback();
    }

    public override disconnectedCallback(): void {
      super.disconnectedCallback();
    }
  }

  return SuperElement;
}

/**
 * Extend your components from this. Will have QA tag and metadata
 * for the inspector.
 *
 * @public
 */
export class ComponentElement extends ComponentMixin<Constructor<ReactiveElement>>(LitElement) {
  declare inspect: boolean;

  /**
   * @public
   */
  public registry: ComponentMetadata;

  constructor(registry: ComponentMetadata) {
    super();

    this.registry = Object.freeze(registry);
    this.dataset.qa = registry.qa;
  }
}

/**
 * Register a custom element Lit class component
 *
 * @public
 */
export function defineWebComponent<WebComponent extends ComponentElement>(
  name: string,
  component: new () => WebComponent,
  options: WebComponentOptions = {}
): new () => WebComponent {
  Object.defineProperty(component.prototype, 'settings', {
    enumerable: true,
    value: options,
    writable: true
  });

  window.customElements.define(name, component);

  return component;
}
