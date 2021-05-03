import { defineComponent, provide, reactive, toRefs } from 'vue';

import { EventEmitter } from '@/utils/emitter';

import { FormToken } from './token';

const VuiForm = defineComponent({
  name: 'VuiForm',
  props: {
    model: Object
  },
  setup(props) {
    const formEmitter = new EventEmitter();

    const form = reactive({
      formEmitter,
      ...toRefs(props)
    });

    provide(FormToken, form);
  }
});

export default VuiForm;
