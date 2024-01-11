import { css } from 'lit';
import { html } from 'lit/html.js';

// eslint-disable-next-line import/no-unassigned-import
import './lib/ui/inspector.js';
import { ComponentElement, defineWebComponent } from './lib/web-component.js';
import type { ComponentMetadata } from './types/component.js';
import { property } from './utilities/decorators.js';

const metadata: ComponentMetadata = {
  description: 'A card component.',
  link: 'https://websublime.dev',
  name: 'Card Component',
  qa: 'card-component',
  scope: '@websublime/vitamin-core/card',
  version: '0.0.1'
};

const headMetadata: ComponentMetadata = {
  description: 'A head component.',
  link: 'https://websublime.dev',
  name: 'Head Component',
  qa: 'head-component',
  scope: '@websublime/vitamin-core/head',
  version: '0.0.1'
};

export class HeadComponent extends ComponentElement {
  @property({ type: String })
  override title = 'HeadComponent';

  constructor() {
    super(headMetadata);
  }

  render() {
    return html`<p>${this.title}</p>`;
  }
}

export class CardComponent extends ComponentElement {
  @property({ type: String })
  override title = 'Card Component!';

  constructor() {
    super(metadata);
  }

  render() {
    return html`
      <h1>${this.title}</h1>
      <head-component></head-component>
    `;
  }
}

defineWebComponent('head-component', HeadComponent, {});
defineWebComponent('card-component', CardComponent, {});
