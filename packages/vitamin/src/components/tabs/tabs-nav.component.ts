/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { NOOP } from '@vue/shared';
import { ComponentInternalInstance, computed, defineComponent, h, PropType } from 'vue';

import { slugify } from '@/utils/helpers';

const TabsNav = defineComponent({
  name: 'VuiTabsNav',
  props: {
    current: {
      default: '0',
      type: String
    },
    handleTabClick: {
      default: NOOP,
      // eslint-disable-next-line no-unused-vars
      type: (Function as PropType<(tab: ComponentInternalInstance, name: string, event: Event) => void>)
    },
    isBottom: {
      default: false,
      type: Boolean
    },
    isLeft: {
      default: false,
      type: Boolean
    },
    isRight: {
      default: false,
      type: Boolean
    },
    isTop: {
      default: true,
      type: Boolean
    },
    tabs: {
      default: () => [],
      type: ([Object] as PropType<ComponentInternalInstance[]>)
    }
  },
  render() {
    const { currentTab, handleTabClick, isBottom, isLeft, isRight, isTop, navTabs } = this;
    const nav = navTabs.map((tab, idx) => {
      const { props, slots } = tab;
      const { nav = null } = slots || {};
      const { id = null, isDisabled = false, label = null } = props || {};

      if (!id) {
        tab.props.id = `${idx}`;
      }

      const isActive = currentTab === tab.props.id;
      const name = slugify(label);

      return h(
        'span',
        {
          'aria-disabled': isDisabled,
          'aria-selected': isActive,
          class: [
            'vui-tabs__tab',
            {
              'vui-tabs__tab--active': isActive,
              'vui-tabs__tab--bottom': isBottom,
              'vui-tabs__tab--disable': isDisabled,
              'vui-tabs__tab--left': isLeft,
              'vui-tabs__tab--right': isRight,
              'vui-tabs__tab--top': isTop
            }
          ],
          key: `tab-${name}`,
          onClick: event => handleTabClick(tab, label, event),
          'role': 'tab',
          tabIndex: isActive ? 0 : -1
        },
        nav ? nav() : label
      );
    });

    return h('nav', { class: 'vui-tabs__nav'}, nav);
  },
  setup(props) {
    const navTabs = computed(() => props.tabs);
    const currentTab = computed(() => props.current);

    return {
      currentTab,
      navTabs
    };
  }
});

export default TabsNav;
