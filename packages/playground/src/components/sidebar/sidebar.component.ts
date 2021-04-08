import { Icon } from '@iconify/vue';
import { defineComponent, PropType } from 'vue';

import { useApplicationContext } from '@/api/context/application.context';
import { ApplicationStateDefinition } from '@/api/context/types';

type Links = {
  title: string;
  icon: string;
  route: string;
  description: string;
}[];

const SidebarComponent = defineComponent({
  components: {
    Icon
  },
  name: 'VtSidebar',
  props: {
    isOpen: {
      default: true,
      type: Boolean
    },
    links: {
      default: () => [],
      type: Array as PropType<Links>
    }
  },
  setup() {
    const { dark } = useApplicationContext() as ApplicationStateDefinition;

    return {
      isActive: false,
      isDark: dark
    };
  }
});

export default SidebarComponent;
