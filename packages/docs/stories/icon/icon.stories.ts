import type { Meta, StoryObj } from '@storybook/web-components';
import { IconsMap } from '@websublime/vitamin-theme/icons.js';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { registerComponents } from '../loader.js';

registerComponents();

type Story = StoryObj;

const meta: Meta = {
  argTypes: {
    name: {
      control: {
        description: 'Bootstrap icon name',
        type: 'text'
      }
    }
  },
  component: 'ui-icon',
  tags: ['autodocs'],
  title: 'Elements/Icon'
};

export default meta;

export const Icon: Story = {
  args: {
    name: 'github'
  },

  render: ({ name }) =>
    html`<ui-icon style="width: 48px; height: 48px; display: block; color: black" name="${name}"></ui-icon>`
};

export const Icons: Story = {
  parameters: {
    docs: {
      toc: {
        disable: true
      }
    }
  },
  render: () => {
    const icons = [...IconsMap.keys()];

    return html`
      <div style="display: flex; flex-flow: row wrap;">
        ${repeat(
          icons,
          (icon) => html`
            <div
              style="display: inline-flex;flex-direction: row;flex: 0 1 calc(20% - 10px); min-width: 120px; margin: 0px 10px 30px 0;align-items: center;"
            >
              <div
                style="padding: 2px;border-radius: 4px; background: #FFFFFF; box-shadow: rgba(0, 0, 0, 0.10) 0 1px 3px 0; border: 1px solid hsla(203, 50%, 30%, 0.15); overflow: hidden; height: 40px; width: 40px; justify-content: center;"
              >
                <ui-icon style="width: 48px; height: 48px; display: block; color: black" name="${icon}"></ui-icon>
              </div>
              <span style="margin-left: 6px;display:block">${icon}</span>
            </div>
          `
        )}
      </div>
    `;
  }
};
