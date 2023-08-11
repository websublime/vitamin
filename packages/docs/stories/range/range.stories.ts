import { withActions } from '@storybook/addon-actions/decorator';
import type { Meta, StoryObj } from '@storybook/web-components';
import { RangeElement } from '@websublime/vitamin-ui/element/range.js';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { registerComponents } from '../loader.js';

registerComponents();

type Story = StoryObj;

/**
 * # Range stories
 * These stories showcase the range
 */
const meta: Meta<RangeElement> = {
  argTypes: {
    max: {
      control: 'number',
      defaultValue: 0,
      description: 'Property to set default maximum value'
    },
    min: {
      control: 'number',
      defaultValue: 0,
      description: 'Property to set default minimum value'
    },
    value: {
      control: 'number',
      defaultValue: 0,
      description: 'Property to set default value'
    }
  },
  component: 'ui-range',
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  decorators: [withActions as any],
  parameters: {
    actions: {
      handles: ['change']
    }
  },
  tags: ['autodocs'],
  title: 'Elements/Range'
};

export default meta;

/**
 * # Simple Range
 * Range with no label
 */
export const Range: Story = {
  args: { max: 100, min: 0, value: 10 },
  render: ({ max, min, value }) => html`<ui-range .max="${max}" .min="${min}" .value="${value}"></ui-range>`
};

/**
 * # Styling Range
 * How to style Range. Css variables are present in .ui-range class.
 */
export const RangeStyle: Story = {
  render: () => html`
    <style>
      .range-props {
        --range-width: 100%;
        --range-height: 4px;
        --range-border-radius: 5px;
        --range-thumb-width: 15px;
        --range-thumb-height: 15px;
        --range-thumb-border-radius: 50%;
        --range-thumb-hover-box-shadow: 0px 0px 0px 8px theme('colors.grey');
        --range-background-color: theme('colors.grey');
        --range-thumb-background-color: theme('colors.white');
      }
    </style>

    <p>See show code</p>
  `
};

/**
 * # Label Range
 * Range with label
 */
export const RangeLabel: Story = {
  args: { max: 100, min: 0, value: 10 },
  render: ({ max, min, value }) =>
    html`
      <ui-range .max="${max}" .min="${min}" .value="${value}">
        <span class="text-black dark:text-white" slot="min">0</span>
        <span class="text-black dark:text-white" slot="max">100</span>
      </ui-range>
    `
};
