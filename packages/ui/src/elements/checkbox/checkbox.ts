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
import type { CheckboxElementOptions } from './types.js';

const metadata: ComponentMetadata = {
  description: 'Checkbox component',
  link: 'https://websublime.dev/elements/checkbox',
  name: 'Checkbox Component',
  qa: 'ui-checkbox',
  scope: '@websublime/vitamin-ui',
  version
};

export class CheckboxElement extends ComponentElement<CheckboxElementOptions> {
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
      <label class="ui-checkbox-label" for="checkbox">
        <input type="checkbox" id="checkbox" @change=${this.handleChange} .checked=${this.checked} />
        <slot name="label"></slot>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-checkbox': CheckboxElement;
  }
}
