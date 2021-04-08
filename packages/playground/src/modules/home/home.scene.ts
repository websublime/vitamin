import { defineComponent } from 'vue';

import { useApplicationContext } from '@/api/context/application.context';
import { ApplicationStateDefinition } from '@/api/context/types';
import VtHero from '@/components/hero/hero.component.vue';

const HomeScene = defineComponent({
  components: {
    VtHero
  },
  name: 'VtHome',
  setup() {
    const { dark, toggleTheme } = useApplicationContext() as ApplicationStateDefinition;

    return {
      dark,
      toggleTheme
    };
  }
});

export default HomeScene;
