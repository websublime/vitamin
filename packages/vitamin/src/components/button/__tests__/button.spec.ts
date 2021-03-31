import { mount } from '@vue/test-utils';

import VuiButton from '../button.component.vue';

describe('> Button component', () => {
  test('render test & class', () => {
    const wrapper = mount(VuiButton, {
      slots: {
        default: 'Default button'
      }
    });
    expect(wrapper.find('.vui-button').text()).toEqual('Default button');
    expect(wrapper.find('.vui-button').classes()).toContain('vui-button--default');
  });

  test('type danger', () => {
    const wrapper = mount(VuiButton, {
      props: {
        type: 'danger'
      },
      slots: {
        default: 'Danger'
      }
    });
    expect(wrapper.find('.vui-button').text()).toEqual('Danger');
    expect(wrapper.find('.vui-button').classes()).toContain('vui-button--danger');
  });

  test('click', async () => {
    const wrapper = mount(VuiButton, {
      props: {
        border: true,
        type: 'info'
      },
      shallow: false
    });

    const btn = wrapper.find('.vui-button');

    expect(btn.exists()).toBe(true);

    await btn.trigger('click');
    expect(wrapper.emitted()).toBeDefined();
  });
});
