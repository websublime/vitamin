import { defineComponent, h, resolveComponent } from 'vue';

import { useApplicationContext } from '@/api/context/application.context';
import { ApplicationStateDefinition } from '@/api/context/types';

const ApplicationContainer = defineComponent({
  setup(props, { attrs }) {
    const { dark, useDarkMode, useLightMode } = useApplicationContext() as ApplicationStateDefinition;

    dark.value ? useDarkMode() : useLightMode();

    return () => h(
      resolveComponent('router-view'),
      {
        attrs: { ...attrs },
        props
      }
    );
  }
});

export default ApplicationContainer;
