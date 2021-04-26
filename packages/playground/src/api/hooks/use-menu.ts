import { computed } from '@vue/runtime-core';
import { useRoute } from 'vue-router';

export const useMenu = () => {
  const route = useRoute();

  const menu = [
    {
      description: 'Vitamin configuration',
      icon: 'carbon:chemistry',
      route: 'Config',
      title: 'Config'
    },
    {
      description: 'Alert component',
      icon: 'carbon:medication-alert',
      route: 'Alert',
      title: 'Alert'
    },
    {
      description: 'Button component',
      icon: 'carbon:center-circle',
      route: 'Button',
      title: 'Button'
    },
    {
      description: 'Card component',
      icon: 'carbon:account',
      route: 'Card',
      title: 'Card'
    },
    {
      description: 'Tabs component',
      icon: 'carbon:view-mode-2',
      route: 'Tabs',
      title: 'Tabs'
    }
  ];

  const activeRouteRef = computed(() => menu.find(item => item.route === route.name));

  return {
    activeMenu: activeRouteRef,
    menu
  };
};
