/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { Icon } from '@iconify/vue';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useOptions } from '../../utils/hooks';
import { eventProps, shapeProps } from '../../utils/props';

const TYPE_CLASSES_MAP = {
  'error': 'error',
  'info': 'info',
  'success': 'check',
  'warning': 'warning'
};

type Type = 'success'|'info'|'error'|'warning';

const { isClosable } = eventProps;

const AlertComponent = defineComponent({
  components: {
    Icon
  },
  emits: ['close'],
  name: 'VuiAlert',
  props: {
    description: {
      default: '',
      type: String
    },
    isClosable,
    title: {
      default: '',
      type: String
    },
    type: {
      default: 'info',
      type: String as PropType<Type>,
      validator: (value: string) => [
        'error',
        'info',
        'warning',
        'success'
      ].includes(value)
    },
    withMedia: {
      default: true,
      type: Boolean
    },
    ...shapeProps
  },
  setup(props, { emit }) {
    const { iconifyPrefix } = useOptions();
    const visibility = ref(true);

    const typeClass = computed(() => `vui-alert--${props.type}`);
    const typeMedia = computed(() => `vui-alert--media-${props.type}`);
    const titleRef = computed(() => props.title);
    const borderRef = computed(() => props.hasBorder);
    const shadowRef = computed(() => `vui-alert--shadow-${props.shadow}`);
    const roundRef = computed(() => `vui-alert--round-${props.rounded}`);
    const closeIconRef = computed(() => iconifyPrefix ? `${iconifyPrefix}:close` : 'close');
    const mediaIconRef = computed(() => iconifyPrefix ? `${iconifyPrefix}:${TYPE_CLASSES_MAP[props.type]}` : `${TYPE_CLASSES_MAP[props.type]}`);
    const closableRef = computed(() => props.isClosable);
    const descriptionRef = computed(() => props.description);

    const handleClose = (event: UIEvent) => {
      visibility.value = false;
      emit('close', event);
    };

    return {
      borderRef,
      closableRef,
      closeIconRef,
      descriptionRef,
      handleClose,
      mediaIconRef,
      roundRef,
      shadowRef,
      titleRef,
      typeClass,
      typeMedia,
      visibility
    };
  }
});

export default AlertComponent;
