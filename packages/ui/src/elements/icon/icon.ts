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
import type { IconKey } from '@websublime/vitamin-theme/icons.js';
// eslint-disable-next-line no-duplicate-imports
import { IconsMap } from '@websublime/vitamin-theme/icons.js';
import { css, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { version } from '../../version.js';

import style from './style.css';

const metadata: ComponentMetadata = {
  description: 'Icon component render svg',
  link: 'https://websublime.dev/elements/icon',
  name: 'Icon Component',
  qa: 'ui-icon',
  scope: '@websublime/vitamin-ui',
  version
};

export class IconElement extends ComponentElement {
  static styles = css`
    ${unsafeCSS(style)}
  `;

  @property({ attribute: 'name', reflect: true, type: String })
  name!: IconKey;

  get icon() {
    const svg = IconsMap.get(this.name);

    return html`${unsafeHTML(svg?.render('class="ui-icon-svg"'))}`;
  }

  constructor() {
    super(metadata);
  }

  connectedCallback(): void {
    super.connectedCallback();

    const { className = [] } = this.options as any; //TODO: fix this

    for (const name of className) {
      this.classList.add(name);
    }
  }

  render() {
    return this.icon;
  }
}
