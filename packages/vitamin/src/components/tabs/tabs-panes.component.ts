/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { defineComponent, h } from 'vue';

const TabsPanes = defineComponent({
  name: 'VuiTabsPanes',
  setup(props, { slots }) {
    return () => h('section', { class: 'vui-tabs__panes', ...props}, slots?.default());
  }
});

export default TabsPanes;
