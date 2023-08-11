import { withActions } from '@storybook/addon-actions/decorator';
import type { Meta, StoryObj } from '@storybook/web-components';
import { LimiterElement } from '@websublime/vitamin-ui/element/limiter.js';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { registerComponents } from '../loader.js';

registerComponents();

type Story = StoryObj;

/**
 * # Limiter stories
 * These stories showcase the limiter
 */
const meta: Meta<LimiterElement> = {
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
  component: 'ui-limiter',
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  decorators: [withActions as any],
  parameters: {
    actions: {
      handles: ['change']
    }
  },
  tags: ['autodocs'],
  title: 'Elements/Limiter'
};

export default meta;

/**
 * # Simple Limiter
 * Limiter dragging vertical dots
 */
export const Limiter: Story = {
  args: { max: 100, min: 0, value: 10 },
  render: ({ max, min, value }) => html`<ui-limiter .max="${max}" .min="${min}" .value="${value}"></ui-limiter>`
};

/**
 * # Styling Limiter
 * How to style Limiter. Css variables are present in .ui-limiter class.
 */
export const LimiterStyle: Story = {
  render: () => html`
    <style>
      .limiter-props {
        --limiter-size: 24px;
        --limiter-outline-width: 1px;
        --limiter-outline-style: solid;
        --limiter-bar-color: theme('colors.grey-light');
        --limiter-outline-color: theme('colors.grey-dark');
        --limiter-drag-color: theme('colors.grey-dark');
      }
    </style>

    <p>See show code</p>
  `
};
