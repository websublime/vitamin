/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import { LitElement, PropertyValues, ReactiveElement } from 'lit';

import { ComponentMetadata, ComponentMixinInterface, Constructor, WebComponentOptions } from '../types/index.js';

import { property } from './decorators.js';
import { InspectController } from './inspect-controller.js';

/**
 * @public
 */
export function ComponentMixin<T extends Constructor<ReactiveElement>>(
  // rome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  constructor: T
): T & Constructor<ComponentMixinInterface> {
  class SuperElement extends constructor {
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

    /**
     * @internal
     * @readonly
     */
    public override connectedCallback(): void {
      super.connectedCallback();
    }

    /**
     * @internal
     * @readonly
     */
    public override disconnectedCallback(): void {
      super.disconnectedCallback();
    }

    /**
     * @internal
     * @readonly
     */
    public override updated(changedProperties: PropertyValues) {
      super.updated?.(changedProperties);
    }
  }

  return SuperElement as Constructor<SuperElement> & T;
}

/**
 * Extend your components from this. Will have QA tag and metadata
 * for the inspector.
 *
 * @public
 */
export class ComponentElement<Options = WebComponentOptions> extends ComponentMixin<Constructor<ReactiveElement>>(
  LitElement
) {
  readonly componentOptions!: Options;
  declare inspect: boolean;

  protected inspector = new InspectController(this);

  protected _options!: Options;

  set options(options: Options) {
    const oldValue = {
      ...this.componentOptions,
      ...this._options
    };

    this._options = {
      ...this.componentOptions,
      ...options
    };

    this.requestUpdate('options', oldValue);
  }

  /**
   * @public
   */
  @property({ type: Object })
  get options() {
    return this._options ?? this.componentOptions;
  }

  /**
   * @public
   */
  public registry: ComponentMetadata;

  constructor(registry: ComponentMetadata) {
    super();

    this.registry = Object.freeze(registry);
    this.dataset.qa = registry.qa;
  }

  protected createRenderRoot() {
    const root = super.createRenderRoot();

    return root;
  }
}

/**
 * Register a custom element Lit class component
 *
 * @public
 */
export function defineWebComponent<WebComponent extends ComponentElement>(
  name: string,
  component: Constructor<WebComponent>,
  options: WebComponentOptions = {}
): Constructor<WebComponent> {
  Object.defineProperty(component.prototype, 'componentOptions', {
    enumerable: true,
    value: options,
    writable: true
  });

  window.customElements.define(name, component);

  return component;
}
