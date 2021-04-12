/* eslint-disable no-unused-vars */
import { Ref } from 'vue';

export type ApplicationStateDefinition = {
  dark: Ref<boolean>;
  disableSidebar: () => void;
  disableSidebarVisibility: () => void;
  enableSidebar: () => void;
  enableSidebarVisibility: () => void;
  isSidebarEnabled: Ref<boolean>;
  isSidebarVisible: Ref<boolean>;
  setSidebarState: (visibility: boolean, enable: boolean) => void;
  toggleSidebarEnable: () => void;
  toggleSidebarVisibility: () => void;
  toggleTheme: () => void;
  useDarkMode: () => void;
  useLightMode: () => void;
};
