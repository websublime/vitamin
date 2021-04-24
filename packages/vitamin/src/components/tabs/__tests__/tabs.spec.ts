import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import VuiTabItem from '../tab-item.component';
import VuiTabs from '../tabs.component';
import VuiTabsNav from '../tabs-nav.component';
// import VuiTabsPanes from '../tabs-panes.component';

describe('> Tabs component', () => {
  test('render test & class', async () => {
    const wrapper = mount({
      components: {
        'vui-tab-item': VuiTabItem,
        'vui-tabs': VuiTabs
      },
      template: `
        <vui-tabs>
          <vui-tab-item label="One">First</vui-tab-item>
          <vui-tab-item label="Two">Second</vui-tab-item>
          <vui-tab-item label="Three">Third</vui-tab-item>
          <vui-tab-item label="Four">Fourth</vui-tab-item>
        </vui-tabs>
      `
    });

    const navWrapper = wrapper.findComponent(VuiTabsNav);
    const itemsWrapper = wrapper.findAllComponents(VuiTabItem);
    await nextTick();

    const [navFirstWrapper, navSecondWrapper, navThirdWrapper, navFourthWrapper] = navWrapper.findAll('.vui-tabs__tab');

    expect(navFirstWrapper.classes('vui-tabs__tab--active')).toBe(true);
    expect(navFirstWrapper.attributes('tabindex')).toBe('0');
    expect(navFirstWrapper.attributes('aria-selected')).toEqual('true');
    expect(navSecondWrapper.attributes('tabindex')).toBe('-1');
    expect(navSecondWrapper.attributes('aria-selected')).toEqual('false');
    expect(navThirdWrapper.attributes('tabindex')).toBe('-1');
    expect(navThirdWrapper.attributes('aria-selected')).toEqual('false');
    expect(navFourthWrapper.attributes('tabindex')).toBe('-1');
    expect(navFourthWrapper.attributes('aria-selected')).toEqual('false');
    expect(itemsWrapper[0].classes('vui-tab__pane-active')).toBe(true);

    await navSecondWrapper.trigger('click');
    expect(navSecondWrapper.classes('vui-tabs__tab--active')).toBe(true);
    expect(navSecondWrapper.attributes('tabindex')).toBe('0');
    expect(itemsWrapper[1].classes('vui-tab__pane-active')).toBe(true);
  });

  test('v-model', async () => {
    const wrapper = mount({
      components: {
        'vui-tab-item': VuiTabItem,
        'vui-tabs': VuiTabs
      },
      data() {
        return {
          currentTab: '1'
        };
      },
      template: `
        <vui-tabs v-model="currentTab">
          <vui-tab-item label="One">First</vui-tab-item>
          <vui-tab-item label="Two">Second</vui-tab-item>
          <vui-tab-item label="Three">Third</vui-tab-item>
          <vui-tab-item label="Four">Fourth</vui-tab-item>
        </vui-tabs>
      `
    });

    const tabsWrapper = wrapper.findComponent(VuiTabs);
    const navWrapper = wrapper.findComponent(VuiTabsNav);
    const itemsWrapper = wrapper.findAllComponents(VuiTabItem);
    await nextTick();

    const [navFirstWrapper, navSecondWrapper] = navWrapper.findAll('.vui-tabs__tab');

    expect(navSecondWrapper.classes('vui-tabs__tab--active')).toBe(true);
    expect(navSecondWrapper.attributes('tabindex')).toBe('0');
    expect(itemsWrapper[1].classes('vui-tab__pane-active')).toBe(true);
    expect(navFirstWrapper.attributes('tabindex')).toBe('-1');
    expect((tabsWrapper.vm as any).current).toEqual('1');
  });

  test('change', async () => {
    const wrapper = mount({
      components: {
        'vui-tab-item': VuiTabItem,
        'vui-tabs': VuiTabs
      },
      data() {
        return {
          changed: null,
          currentTab: '1'
        };
      },
      methods: {
        handleChanged(id) {
          this.changed = id;
        }
      },
      template: `
        <vui-tabs v-model="currentTab" @change="handleChanged">
          <vui-tab-item label="One">First</vui-tab-item>
          <vui-tab-item label="Two">Second</vui-tab-item>
          <vui-tab-item label="Three">Third</vui-tab-item>
          <vui-tab-item label="Four">Fourth</vui-tab-item>
        </vui-tabs>
      `
    });

    const navWrapper = wrapper.findComponent(VuiTabsNav);
    await nextTick();

    const [navFirstWrapper] = navWrapper.findAll('.vui-tabs__tab');

    await navFirstWrapper.trigger('click');
    expect(navFirstWrapper.classes('vui-tabs__tab--active')).toBe(true);
    expect(navFirstWrapper.attributes('tabindex')).toBe('0');
    expect(wrapper.vm.changed).toEqual('0');
  });
});
