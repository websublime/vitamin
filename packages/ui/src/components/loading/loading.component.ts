/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { computed, defineComponent, watch } from 'vue';

import { isBoolean } from '../../utils/helpers';
import { useLoadingContext } from './context';

const LoadingComponent = defineComponent({
  emits: ['update:modelValue'],
  name: 'VuiLoading',
  props: {
    height: {
      default: 12,
      type: Number
    },
    modelValue: {
      default: false,
      type: Boolean
    },
    width: {
      default: 12,
      type: Number
    }
  },
  setup(props, { emit }) {
    const { active, setState } = useLoadingContext() || {};
    const view = computed(() => `0 0 ${props.width * 2} ${props.height * 2}`);

    watch(() => props.modelValue, (state: boolean) => {
      setState(state);

      emit('update:modelValue', state);
    });
    
    if(isBoolean(active.value)) {
      watch(active, (state: boolean) => emit('update:modelValue', state));
    }

    return {
      active,
      view
    };
  }
});

export default LoadingComponent;