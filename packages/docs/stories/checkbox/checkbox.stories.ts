import { withActions } from '@storybook/addon-actions/decorator';
import type { Meta, StoryObj } from '@storybook/web-components';
import { CheckboxElement } from '@websublime/vitamin-ui/element/checkbox.js';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { registerComponents } from '../loader.js';

registerComponents();

type Story = StoryObj;

/**
 * # Checkbox stories
 * These stories showcase the checkbox
 */
const meta: Meta<CheckboxElement> = {
  argTypes: {
    checked: {
      control: 'boolean',
      defaultValue: false,
      description: 'Property to set default checked state'
    }
  },
  component: 'ui-checkbox',
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  decorators: [withActions as any],
  parameters: {
    actions: {
      handles: ['change']
    }
  },
  tags: ['autodocs'],
  title: 'Elements/Checkbox'
};

export default meta;

/**
 * # Simple Checkbox
 * Checkbox with no label
 */
export const Checkbox: Story = {
  args: { checked: false },
  render: ({ checked }) => html`<ui-checkbox .checked="${checked}"></ui-checkbox>`
};

/**
 * # Styling Checkbox
 * How to style Checkbox. Css variables are present in .ui-checkbox class.
 */
export const CheckboxStyle: Story = {
  render: () => html`
    <style>
      .switch-props {
        --checkbox-checked-color: theme('colors.grey-dark');
        --checkbox-background-color: theme('colors.white');
        --checkbox-hover-color: theme('colors.grey-dark');
        --checkbox-diameter: 20px;
        --checkbox-border-radius: 5px;
        --checkbox-border-color: theme('colors.grey');
        --checkbox-border-width: 1px;
        --checkbox-border-style: solid;
        --checkbox-checkmark-size: 1.2;
      }
    </style>

    <p>See show code</p>
  `
};

/**
 * # Label Checkbox
 * Checkbox with label
 */
export const CheckboxLabel: Story = {
  args: {},
  render: ({ name }) =>
    html` <ui-checkbox><span class="text-black dark:text-white" slot="label">Checked</span></ui-checkbox> `
};
