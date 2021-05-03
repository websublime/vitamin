/* eslint-disable no-unused-vars */
import { defineComponent, inject, ref } from 'vue';

import { FormItemToken, FormToken } from '../form';

const VuiInput = defineComponent({
  emits: ['blur', 'change', 'focus'],
  name: 'VuiInput',
  props: {
    label: {
      default: null,
      type: String
    },
    placeholder: {
      default: null,
      type: String
    },
    type: {
      default: 'text',
      type: String,
      validator: (value: string) => [
        'button',
        'checkbox',
        'color',
        'date',
        'datetime-local',
        'email',
        'file',
        'hidden',
        'image',
        'month',
        'number',
        'password',
        'radio',
        'range',
        'reset',
        'search',
        'submit',
        'tel',
        'text',
        'textarea',
        'time',
        'url',
        'week'
      ].includes(value)
    }
  },
  setup(props, { emit }) {
    const focusRef = ref(false);

    const form = inject(FormToken, {} as any);
    const formItem = inject(FormItemToken, {} as any);

    const handleFocus = (event: UIEvent) => {
      focusRef.value = true;
      emit('focus', event);
    };

    const handleBlur = (event: UIEvent) => {
      focusRef.value = false;
      emit('blur', event);
    };

    const handleChange = event => {
      emit('change', event.target.value);
    };

    return {
      handleBlur,
      handleChange,
      handleFocus
    };
  }
});

export default VuiInput;
