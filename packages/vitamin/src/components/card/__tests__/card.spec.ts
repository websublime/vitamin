import { mount } from '@vue/test-utils';

import VuiCard from '../card.component.vue';

describe('> Card component', () => {
  test('render test & class', () => {
    const wrapper = mount(VuiCard, {
      props: {
        title: 'Card Title'
      },
      shallow: true,
      slots: {
        default: `
              <p>Hello World</p>
            `,
        footer: `
              <p>Footer</p>
            `
      }
    });

    expect(wrapper.find('.vui-card').classes()).toContain('vui-card--shadow-none');
    expect(wrapper.find('.vui-card__title').text()).toEqual('Card Title');
    expect(wrapper.find('.vui-card__footer').classes()).toContain('vui-card__footer');
  });
});
