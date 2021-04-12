import { Icon } from '@iconify/vue';
import { computed, defineComponent } from 'vue';

import { useApplicationContext } from '@/api/context/application.context';
import { ApplicationStateDefinition } from '@/api/context/types';
import { useMenu } from '@/api/hooks/use-menu';
import VtSidebar from '@/components/sidebar/sidebar.component.vue';

const DocumentationContainer = defineComponent({
  components: {
    Icon,
    VtSidebar
  },
  name: 'VtDocumentation',
  setup() {
    const { activeMenu, menu } = useMenu();
    const { dark, toggleTheme } = useApplicationContext() as ApplicationStateDefinition;
    const icon = computed(() => dark.value ? 'carbon:sun' : 'carbon:moon');

    return {
      activeMenu,
      icon,
      menu,
      toggleTheme
    };
  }
});

export default DocumentationContainer;
