import { ComponentMetadata } from '@websublime/vitamin-core';
import { ComponentElement } from '@websublime/vitamin-core/web-component.js';

import { version } from '../../version.js';

const metadata: ComponentMetadata = {
  description: 'Icon component render svg',
  link: 'https://websublime.dev/elements/icon',
  name: 'Icon Component',
  qa: 'ui-icon',
  scope: '@websublime/vitamin-ui',
  version
};

export class IconElement extends ComponentElement {
  constructor() {
    super(metadata);
  }
}
