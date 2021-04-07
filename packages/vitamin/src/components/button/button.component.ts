/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { Icon } from '@iconify/vue';
import { computed, defineComponent, inject, PropType } from 'vue';

import { useOptions } from '../../utils/hooks';
import { displayProps, eventProps, shapeProps } from '../../utils/props';
import { FormToken } from '../form';

type ButtonType = 'default'|'primary'|'info'|'danger'|'success'|'warning';
type ButtonSpace = 'sm'|'md'|'lg'|'xl';

const { isDisabled } = displayProps;
const { isLoading } = eventProps;

const ButtonComponent = defineComponent({
  components: {
    Icon
  },
  emits: ['click'],
  name: 'VuiButton',
  props: {
    iconOnly: {
      default: false,
      type: Boolean
    },
    iconPrefix: {
      default: null,
      type: String
    },
    iconSufix: {
      default: null,
      type: String
    },
    isDisabled,
    isLoading,
    space: {
      default: 'sm',
      type: String as PropType<ButtonSpace>,
      validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    type: {
      default: 'default',
      type: String as PropType<ButtonType>,
      validator: (value: string) => [
        'default',
        'primary',
        'info',
        'danger',
        'success',
        'warning'
      ].includes(value)
    },
    ...shapeProps
  },
  setup(props, { emit }) {
    const { iconifyPrefix } = useOptions();
    const formToken = inject(FormToken, {
      disabled: props.isDisabled
    });

    const borderRef = computed(() => props.hasBorder);
    const iconOnlyRef = computed(() => props.iconOnly);
    const loadingRef = computed(() => props.isLoading);
    const shadowRef = computed(() => `vui-button--shadow-${props.shadow}`);
    const disableRef = computed(() => props.isDisabled || formToken.disabled);
    const classType = computed(() => `vui-button--${props.type}`);
    const spaceType = computed(() => `vui-button--${props.space}`);
    const roundRef = computed(() => `vui-button--round-${props.rounded}`);
    const iconLeftRef = computed(() => props.iconPrefix ? `${iconifyPrefix}:${props.iconPrefix}` : props.iconPrefix);
    const iconRightRef = computed(() => props.iconSufix ? `${iconifyPrefix}:${props.iconSufix}` : props.iconSufix);

    const handleClick = (event: UIEvent) => {
      emit('click', event);
    };

    return {
      borderRef,
      classType,
      disableRef,
      handleClick,
      iconLeftRef,
      iconOnlyRef,
      iconRightRef,
      loadingRef,
      roundRef,
      shadowRef,
      spaceType
    };
  }
});

export default ButtonComponent;
