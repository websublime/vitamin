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
import type { RangeElementOptions } from './types.js';

const metadata: ComponentMetadata = {
  description: 'Range component',
  link: 'https://websublime.dev/elements/range',
  name: 'Range Component',
  qa: 'ui-range',
  scope: '@websublime/vitamin-ui',
  version
};

export class RangeElement extends ComponentElement<RangeElementOptions> {
  static styles = css`
    ${unsafeCSS(style)}
  `;

  @property({ reflect: true, type: Number })
  min = 0;

  @property({ reflect: true, type: Number })
  max = 0;

  @property({ reflect: true, type: Number })
  value = 0;

  @query('input')
  range!: HTMLInputElement;

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
    this.value = Number(this.range.value);

    const event = new CustomEvent('change', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { max: this.max, min: this.min, value: this.value }
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <label for="range">
        <slot name="min"></slot>
        <input
          type="range"
          .min="${this.min}"
          .max="${this.max}"
          .value="${this.value}"
          @change=${this.handleChange}
          id="range"
        />
        <slot name="max"></slot>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-range': RangeElement;
  }
}
