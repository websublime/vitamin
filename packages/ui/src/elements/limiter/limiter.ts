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
import { property, query, state } from 'lit/decorators.js';

import { version } from '../../version.js';

import style from './style.css';
import type { LimiterElementOptions } from './types.js';

const metadata: ComponentMetadata = {
  description: 'Limiter drag component',
  link: 'https://websublime.dev/elements/limiter',
  name: 'Limiter Component',
  qa: 'ui-limiter',
  scope: '@websublime/vitamin-ui',
  version
};

export class LimiterElement extends ComponentElement<LimiterElementOptions> {
  static styles = css`
    ${unsafeCSS(style)}
  `;

  @state()
  isResizing = false;

  @property({ reflect: true, type: Number })
  value!: number;

  @property({ reflect: true, type: Number })
  min = 0;

  @property({ reflect: true, type: Number })
  max = 0;

  @property({ reflect: true, type: Boolean })
  show = true;

  @query('.ui-limiter-bar')
  bar!: HTMLDivElement;

  @query('#drag')
  drag!: HTMLDivElement;

  constructor() {
    super(metadata);
  }

  private mouseDownHandler() {
    this.isResizing = true;
  }

  private mouseUpHandler() {
    this.isResizing = false;
  }

  private mouseMoveHandler(event: MouseEvent) {
    const isTarget = event.target === this;
    const offset = event.offsetX;
    const limit = this.clientWidth;
    const current = Math.trunc((offset * this.max) / limit);

    if (this.isResizing && isTarget && offset <= limit && current >= this.min) {
      this.value = current;
      this.bar.style.width = `${offset}px`;

      if (offset > 12) {
        this.drag.style.left = `${offset - 18}px`;
      }
    }
  }

  firstUpdated() {
    if (!this.value) {
      this.value = this.min;
    }

    const initialPosition = Math.trunc((this.value * this.clientWidth) / this.max);

    if (initialPosition > 12) {
      this.drag.style.left = `${initialPosition - 18}px`;
    }

    this.bar.style.width = `${initialPosition}px`;

    this.drag.addEventListener('mousedown', this.mouseDownHandler.bind(this));
    document.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    document.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('value') && changedProperties.get('value')) {
      this.handleChange();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    const { className = [] } = this.options;

    for (const name of className) {
      this.classList.add(name);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.drag.removeEventListener('mousedown', this.mouseDownHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
  }

  handleChange() {
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
      <div class="ui-limiter-container">
        <div class="ui-limiter-bar">
          <ui-icon name="three-dots-vertical" id="drag"></ui-icon>
        </div>
        <span class="ui-limiter-value">${this.show ? this.value : ''}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-limiter': LimiterElement;
  }
}
