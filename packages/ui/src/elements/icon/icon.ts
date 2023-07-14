import { ComponentMetadata } from '@websublime/vitamin-core';
import { ComponentElement } from '@websublime/vitamin-core/web-component.js';
import type { IconKey } from '@websublime/vitamin-theme/icons.js';
import { IconsMap } from '@websublime/vitamin-theme/icons.js';
import { css, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { version } from '../../version.js';

import style from './style.js';

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

  @property({ attribute: 'class', reflect: true, type: String })
  classes = '';

  get icon() {
    const svg = IconsMap.get(this.name);

    return html`${unsafeHTML(svg?.render(''))}`;
  }

  constructor() {
    super(metadata);
  }

  render() {
    return this.icon;
  }
}
