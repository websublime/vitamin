/**
 * Copyright Vitamin All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://websublime.dev/license
 */

import { computed, defineComponent, ref, watch } from 'vue';

import { useOptions } from '../../utils/hooks';
import { ComponentIconProps, ComponentShapeProps, ComponentStateProps, ComponentVariantProps } from '../../utils/props';
import { VuiIcon } from '../icon';
import { useLoading, VuiLoading } from '../loading';

const ButtonComponent = defineComponent({
  components: { VuiIcon, VuiLoading },
  name: 'VuiButton',
  props: {
    ...ComponentShapeProps,
    ...ComponentStateProps,
    ...ComponentIconProps,
    ...ComponentVariantProps,

    /**
     * Button text
     */
    label: {
      default: null,
      type: String
    },

    /**
     * Type of button
     */
    type: {
      default: 'button',
      type: String,
      validator: (value: string) => [
          'button',
          'submit',
          'reset'
        ].indexOf(value) >= 0
    }
  },
  setup(props) {
    const { iconifyPrefix } = useOptions();
    const { active, setState } = useLoading(props.isLoading);

    const disabled = ref(props.isDisabled);
    const title = ref(props.label);

    const isOnlyIcon = computed(() => props.iconOnly);
    const icon = computed(() => props.icon ? `${iconifyPrefix}:${props.icon}` : props.icon);
    const iconLeft = computed(() => props.iconPrefix ? `${iconifyPrefix}:${props.iconPrefix}` : props.iconPrefix);
    const iconRight = computed(() => props.iconSufix ? `${iconifyPrefix}:${props.iconSufix}` : props.iconSufix);

    watch(() => props.isLoading, state => {
      setState(state);

      disabled.value = state;
    });

    return {
      active,
      disabled,
      icon,
      iconLeft,
      iconRight,
      isOnlyIcon,
      title
    };
  }
});

export default ButtonComponent;
