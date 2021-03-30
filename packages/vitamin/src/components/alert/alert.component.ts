import { useOptions } from '../../utils/use';
import { computed, defineComponent, PropType, ref } from 'vue';
import { Icon } from '@iconify/vue';

const TYPE_CLASSES_MAP = {
  'error': 'error',
  'success': 'check',
  'warning': 'warning',
  'info': 'info'
};

const AlertComponent = defineComponent({
  components: {
    Icon
  },
  emits: ['close'],
  name: 'VuiAlert',
  props: {
    border: {
      default: false,
      type: Boolean
    },
    closable: {
      default: true,
      type: Boolean
    },
    description: {
      default: '',
      type: String
    },
    rounded: {
      default: 'none',
      type: String as PropType<'sm'|'md'|'lg'|'xl'|'2xl'|'none'>
    },
    shadow: {
      default: 'none',
      type: String as PropType<'sm'|'md'|'lg'|'xl'|'2xl'|'none'>
    },
    title: {
      default: '',
      type: String
    },
    type: {
      default: 'info',
      type: String as PropType<'success' | 'info' | 'error' | 'warning'>
    }
  },
  setup(props, { emit }) {
    const { iconifyPrefix } = useOptions();
    const visibility = ref(true);

    const typeClass = computed(() => `vui-alert--${props.type}`);
    const titleRef = computed(() => props.title)
    const borderRef = computed(() => props.border);
    const shadowRef = computed(() => `vui-alert--shadow-${props.shadow}`);
    const roundRef = computed(() => `vui-alert--round-${props.rounded}`);
    const closeIconRef = computed(() => iconifyPrefix ? `${iconifyPrefix}:close` : 'close');
    const closableRef = computed(() => props.closable);
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
      titleRef,
      typeClass,
      roundRef,
      shadowRef,
      visibility
    }
  }
});

export default AlertComponent;
