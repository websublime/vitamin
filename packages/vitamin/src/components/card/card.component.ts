import { computed, defineComponent, PropType } from 'vue';

import { shapeProps } from '../../utils/props';

type Type = 'success'|'info'|'error'|'warning'|'none';

const CardComponent = defineComponent({
  name: 'VuiCard',
  props: {
    image: {
      default: null,
      type: String
    },
    title: {
      default: null,
      type: String
    },
    type: {
      default: 'none',
      type: String as PropType<Type>,
      validator: (value: string) => [
        'none',
        'error',
        'info',
        'warning',
        'success'
      ].includes(value)
    },
    ...shapeProps
  },
  setup(props) {
    const typeClass = computed(() => `vui-card__${props.type}`);
    const typeStyle = computed(() => props.image ? { backgroundImage: `url(${props.image})`} : null);
    const borderRef = computed(() => props.hasBorder);
    const shadowRef = computed(() => `vui-card--shadow-${props.shadow}`);
    const roundRef = computed(() => `vui-card--round-${props.rounded}`);

    return {
      borderRef,
      roundRef,
      shadowRef,
      typeClass,
      typeStyle
    };
  }
});

export default CardComponent;
