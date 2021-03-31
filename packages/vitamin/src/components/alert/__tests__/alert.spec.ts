import { mount } from '@vue/test-utils';

import VuiAlert from '../alert.component.vue';

describe('> Alert component', () => {
  test('render test & class', () => {
    const wrapper = mount(VuiAlert, {
      props: {
        description: 'Alert description',
        title: 'Hello world'
      }
    });
    expect(wrapper.find('.vui-alert__title').text()).toEqual('Hello world');
    expect(wrapper.find('.vui-alert').classes()).toContain('vui-alert--info');
  });

  test('type error', () => {
    const wrapper = mount(VuiAlert, {
      props: {
        description: 'Alert description',
        title: 'Hello world',
        type: 'error'
      }
    });
    expect(wrapper.find('.vui-alert__title').text()).toEqual('Hello world');
    expect(wrapper.find('.vui-alert').classes()).toContain('vui-alert--error');
  });

  test('close', async () => {
    // TODO: research about it
    const wrapper = mount(VuiAlert, {
      global: {
        stubs: {
          Icon: {
            template: '<Icon class="vui-alert__close"/>'
          }
        }
      },
      props: {
        description: 'Alert description',
        title: 'Hello world',
        type: 'error'
      },
      shallow: false
    });

    const closeBtn = wrapper.find('.vui-alert__content');

    // console.log(wrapper.html());
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger('click');
    expect(wrapper.emitted()).toBeDefined();
  });
});
