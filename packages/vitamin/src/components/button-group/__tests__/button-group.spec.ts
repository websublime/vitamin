import { mount } from '@vue/test-utils';

import VuiButtonGroup from '../button-group.component.vue';

describe('> Button group component', () => {
  test('render test & class', () => {
    const wrapper = mount(VuiButtonGroup, {
      shallow: true,
      slots: {
        default: `
            <vui-button type ="info" space="md" rounded="md">Info</vui-button>
            <vui-button type ="info" space="md" rounded="md">Reset</vui-button>
            <vui-button type ="info" space="md" rounded="md">Announce</vui-button>
            `
      }
    });
    expect(wrapper.find('.vui-button-group').exists()).toBe(true);
  });
});
