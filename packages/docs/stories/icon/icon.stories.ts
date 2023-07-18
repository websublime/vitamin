import { registerComponent } from '@websublime/vitamin-ui/plugin/icon.js';
import { html } from 'lit';

registerComponent();

const UiIcon = () => html`<ui-icon name="bootstrap"></ui-icon>`;

export default {
  render: () => UiIcon(),
  tags: ['autodocs'],
  title: 'Example/Icon'
};

export const Icon = {};
