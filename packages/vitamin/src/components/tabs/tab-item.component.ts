/* eslint-disable id-match */
/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { computed, defineComponent, h, inject } from 'vue';

import { TabContext } from './tabs.provider';

const TabItem = defineComponent({
  name: 'VuiTabItem',
  props: {
    id: {
      default: null,
      type: String
    },
    isDisabled: {
      default: false,
      type: Boolean
    },
    label: {
      default: null,
      type: String
    }
  },
  render() {
    const { $slots, active, disable } = this;

    return h(
      'div',
      {
        class: [
          'vui-tab__pane',
          {
            'vui-tab__pane-active': active,
            'vui-tab__pane-disable': disable
          }
        ],
        style: { display: active ? 'block' : 'none'}
      },
      $slots?.default()
    );
  },
  setup(props) {
    const tokenContext = inject(TabContext, null);

    const active = computed(() => tokenContext.tabRef.value === props.id);
    const disable = computed(() => props.isDisabled);

    if (!tokenContext) {
      throw new Error('VuiTabItem should be used inside VuiTabs');
    }

    return {
      active,
      disable
    };
  }
});

export default TabItem;
