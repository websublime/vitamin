// Generate a lit web component from ./utilities/web-component.ts
// that extends the ComponentElement class and has title as prop.

import { html } from 'lit/html.js';

import { ComponentMetadata } from './types/index.js';
import { property } from './utilities/decorators.js';
import { ComponentElement, defineWebComponent } from './utilities/web-component.js';

const metadata: ComponentMetadata = {
  description: 'A card component.',
  link: 'https://websublime.dev',
  name: 'Card Component',
  qa: 'card-component',
  scope: '@websublime/vitamin-core',
  version: '0.0.1'
};

const headMetadata: ComponentMetadata = {
  description: 'A head component.',
  link: 'https://websublime.dev',
  name: 'Head Component',
  qa: 'head-component',
  scope: '@websublime/vitamin-core',
  version: '0.0.1'
};

export class HeadComponent extends ComponentElement {
  @property({ type: String })
  title = 'HeadComponent';

  constructor() {
    super(headMetadata);
  }

  render() {
    return html`<p>${this.title}</p>`;
  }
}

export class CardComponent extends ComponentElement {
  @property({ type: String })
  title = 'Card Component!';

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
