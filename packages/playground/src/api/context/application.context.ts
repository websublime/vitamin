import { computed, inject, InjectionKey, ref } from 'vue';

import { ApplicationStateDefinition } from './types';

export const ApplicationContext = Symbol('ApplicationContext') as InjectionKey<ApplicationStateDefinition>;

export function useApplicationContext(): ApplicationStateDefinition | undefined {
  const context = inject(ApplicationContext);

  if (context === undefined) {
    const err = new Error('Application context not defined');

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(err, useApplicationContext);
      throw err;
    }
  }

  return context;
}

export function provideApplicationContext(options?: {
  isDark?: boolean;
  sidebarVisibility?: boolean;
  sidebarEnable?: boolean;
}): ApplicationStateDefinition {
  const theme = localStorage.getItem('theme');
  const { isDark = theme ? true : false, sidebarEnable = true, sidebarVisibility = false } = options || {};

  const darkRef = ref(isDark);
  const enableSidebarVisibilityRef = ref(sidebarVisibility);
  const enableSidebarRef = ref(sidebarEnable);

  const isSidebarVisible = computed(() => enableSidebarVisibilityRef.value);
  const dark = computed(() => darkRef.value);
  const isSidebarEnabled = computed(() => enableSidebarRef.value);

  const useDarkMode = () => {
    const html = document.querySelector('html');

    if (html) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const useLightMode = () => {
    const html = document.querySelector('html');

    if (html) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    darkRef.value = !darkRef.value;
    darkRef.value ? useDarkMode() : useLightMode();
  };

  const toggleSidebarVisibility = () => {
    enableSidebarVisibilityRef.value = !enableSidebarVisibilityRef.value;
  };

  const toggleSidebarEnable = () => {
    enableSidebarRef.value = !enableSidebarRef.value;
  };

  const disableSidebar = () => {
    enableSidebarRef.value = false;
  };

  const enableSidebar = () => {
    enableSidebarRef.value = true;
  };

  const disableSidebarVisibility = () => {
    enableSidebarVisibilityRef.value = false;
  };

  const enableSidebarVisibility = () => {
    enableSidebarVisibilityRef.value = true;
  };

  const setSidebarState = (visibility: boolean, enable: boolean) => {
    enableSidebarVisibilityRef.value = visibility;
    enableSidebarRef.value = enable;
  };

  return {
    dark,
    disableSidebar,
    disableSidebarVisibility,
    enableSidebar,
    enableSidebarVisibility,
    isSidebarEnabled,
    isSidebarVisible,
    setSidebarState,
    toggleSidebarEnable,
    toggleSidebarVisibility,
    toggleTheme,
    useDarkMode,
    useLightMode
  };
}
