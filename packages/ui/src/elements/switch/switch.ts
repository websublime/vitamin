/**
|--------------------------------------------------------------------------
| Copyright Websublime All Rights Reserved.
|--------------------------------------------------------------------------
|
| Use of this source code is governed by an MIT-style license that can be
| found in the LICENSE file at https://websublime.dev/license
|
*/

import { ComponentMetadata } from '@websublime/vitamin-core';
import { ComponentElement } from '@websublime/vitamin-core/web-component.js';
import { css, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';

import { version } from '../../version.js';

import style from './style.css';
import type { SwitchElementOptions } from './types.js';

const metadata: ComponentMetadata = {
  description: 'Switch component ON/OFF with icon',
  link: 'https://websublime.dev/elements/switch',
  name: 'Switch Component',
  qa: 'ui-switch',
  scope: '@websublime/vitamin-ui',
  version
};

export class SwitchElement extends ComponentElement<SwitchElementOptions> {
  static styles = css`
    ${unsafeCSS(style)}
  `;

  @property({ reflect: true, type: Boolean })
  checked = false;

  @query('input')
  checkbox!: HTMLInputElement;

  constructor() {
    super(metadata);
  }

  connectedCallback(): void {
    super.connectedCallback();

    const { className = [] } = this.options;

    for (const name of className) {
      this.classList.add(name);
    }
  }

  handleChange() {
    this.checked = Boolean(this.checkbox.checked);

    const event = new CustomEvent('change', { bubbles: true, cancelable: true, composed: true, detail: this.checked });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <slot name="left"></slot>
      <label class="ui-switch-label" for="switch">
        <slot name="prepend"></slot>
        <slot name="append"></slot>
        <input type="checkbox" id="switch" @change=${this.handleChange} .checked=${this.checked} />
        <div class="ui-switch-slider"></div>
      </label>
      <slot name="right"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-switch': SwitchElement;
  }
}
