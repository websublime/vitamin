import { withActions } from '@storybook/addon-actions/decorator';
import type { Meta, StoryObj } from '@storybook/web-components';
import { SwitchElement } from '@websublime/vitamin-ui/element/switch.js';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { registerComponents } from '../loader.js';

registerComponents();

type Story = StoryObj;

/**
 * # Switch stories
 * These stories showcase the switch
 */
const meta: Meta<SwitchElement> = {
  argTypes: {
    checked: {
      control: 'boolean',
      defaultValue: false,
      description: 'Property to set default checked state'
    }
  },
  component: 'ui-switch',
  // rome-ignore lint/suspicious/noExplicitAny: <explanation>
  decorators: [withActions as any],
  parameters: {
    actions: {
      handles: ['change']
    }
  },
  tags: ['autodocs'],
  title: 'Elements/Switch'
};

export default meta;

/**
 * # Simple Switch
 * Switch with no label or icon
 */
export const Switch: Story = {
  args: { checked: false },
  render: ({ checked }) => html`<ui-switch .checked="${checked}"></ui-switch>`
};

/**
 * # Styling Switch
 * How to style switch. Css variables are present in .ui-switch class.
 */
export const SwitchStyle: Story = {
  render: () => html`
    <style>
      .switch-props {
        --switch-width: 60px;
        --switch-height: 30px;
        --switch-button-width: 24px;
        --switch-button-height: 24px;
        --switch-button-radius: 20px;
        --switch-bar-radius: 300px;
        --switch-padding-y: 0;
        --switch-padding-x: theme('padding.1');
        --switch-color: theme('colors.grey');
        --switch-bar-background: theme('colors.grey-dark');
        --switch-button-on-background: theme('colors.white');
        --switch-button-off-background: theme('colors.grey');
        --swicth-label-font-size: calc(var(--switch-height) - 10px);
        --switch-button-transform: translate(calc(var(--switch-width) - 22px));
        --switch-transition: 0.4s;
        --switch-button-left: 3px;
        --switch-button-bottom: 3px;
      }
    </style>

    <p>See show code</p>
  `
};

/**
 * # Icon Switch
 * Switch with icon for each state
 */
export const SwitchIcon: Story = {
  render: ({ name }) =>
    html`
      <ui-switch><ui-icon slot="prepend" name="moon"></ui-icon><ui-icon slot="append" name="sun"></ui-icon></ui-switch>
    `
};

/**
 * # Label Switch
 * Switch with label for each state
 */
export const SwitchLabel: Story = {
  args: {},
  render: ({ name }) =>
    html`
      <ui-switch
        ><span class="text-black dark:text-white" slot="left">OFF</span>
        <span class="text-black dark:text-white" slot="right">ON</span></ui-switch
      >
    `
};

/**
 * # Full Switch
 * Switch with label and icon for each state
 */
export const SwitchAll: Story = {
  args: {},
  render: ({ name }) => html`
    <ui-switch
      ><span class="text-black dark:text-white" slot="left">OFF</span>
      <span class="text-black dark:text-white" slot="right">ON</span>
      <ui-icon style="color: red" slot="prepend" name="moon"></ui-icon>
      <ui-icon style="color: green" slot="append" name="sun"></ui-icon
    ></ui-switch>
  `
};
