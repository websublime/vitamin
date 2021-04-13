/* eslint-disable id-match */
/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import {
  ComponentInternalInstance,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  PropType,
  provide,
  ref,
  resolveComponent,
  VNode,
  watch
} from 'vue';

import { findViewChildren } from '@/utils/helpers';

import { TabContext, TabPosition, TabsDefinition } from './tabs.provider';
import VuiTabsNav from './tabs-nav.component';
import VuiTabsPanes from './tabs-panes.component';

const Tabs = defineComponent({
  components: {
    VuiTabsNav,
    VuiTabsPanes
  },
  emits: ['click', 'change', 'update:modelValue'],
  name: 'VuiTabs',
  props: {
    activeTab: {
      default: '',
      type: String
    },
    hasBorder: {
      default: true,
      type: Boolean
    },
    modelValue: {
      default: '',
      type: String
    },
    position: {
      default: 'top',
      type: (String as PropType<TabPosition>),
      validator: (value: string) => ['top', 'right', 'bottom', 'left'].includes(value)
    }
  },
  render() {
    const {
      $slots,
      current,
      handleTabClick,
      hasBorder,
      isBottom,
      isLeft,
      isRight,
      isTop,
      tabs
    } = this;

    const nav = h(
      resolveComponent('VuiTabsNav'),
      {
        class: [{
          'vui-tabs__nav--border': hasBorder,
          'vui-tabs__nav--bottom': isBottom,
          'vui-tabs__nav--left': isLeft,
          'vui-tabs__nav--right': isRight,
          'vui-tabs__nav--top': isTop
        }],
        current,
        handleTabClick,
        isBottom,
        isLeft,
        isRight,
        isTop,
        tabs
      }
    );

    const content = h(resolveComponent('VuiTabsPanes'), $slots?.default);

    return h(
      'div',
      {
        class: [
          'vui-tabs',
          {
            'vui-tabs__bordered': hasBorder,
            'vui-tabs--bottom': isBottom,
            'vui-tabs--left': isLeft,
            'vui-tabs--right': isRight,
            'vui-tabs--top': isTop
          }
        ]
      },
      isBottom || isRight ? [content, nav] : [nav, content]
    );
  },
  setup(props: TabsDefinition, { emit, slots }) {
    const tabRef = ref(props.modelValue || props.activeTab || '0');
    const instance = getCurrentInstance();
    const tabsRef = ref([]);

    provide(TabContext, {
      ...props,
      tabRef
    });

    watch(() => props.modelValue, value => {
      handleChangeTab(value);
    });

    watch(() => props.activeTab, value => {
      handleChangeTab(value);
    });

    const setTabs = () => {
      if (slots.default && instance) {
        const { children } = instance.subTree;

        const [tabsPanes] = findViewChildren('VuiTabsPanes', children as ArrayLike<VNode>);

        if (tabsPanes) {
          const tabsItems = findViewChildren('VuiTabItem', tabsPanes.subTree.children as ArrayLike<VNode>);

          tabsRef.value = tabsItems;
        }
      }
    };

    const handleTabClick = (tab: ComponentInternalInstance, name: string, event: UIEvent) => {
      const { id, isDisabled = false } = tab.props;

      if (!isDisabled) {
        emit('click', name, event);
        handleChangeTab(id as string);
      }
    };

    const handleChangeTab = (id: string) => {
      tabRef.value = id;

      emit('change', id);
      emit('update:modelValue', id);
    };

    onMounted(() => setTabs());

    const isTop = computed(() => props.position === 'top');
    const isBottom = computed(() => props.position === 'bottom');
    const isLeft = computed(() => props.position === 'left');
    const isRight = computed(() => props.position === 'right');

    return {
      current: tabRef,
      handleTabClick,
      isBottom,
      isLeft,
      isRight,
      isTop,
      tabs: tabsRef
    };
  }
});

export default Tabs;
