import { App, Plugin } from 'vue';

import { registerComponent } from '../../utils/plugins';
import VuiTabItem from './tab-item.component';
import VuiTabs from './tabs.component';
import VuiTabsNav from './tabs-nav.component';
import VuiTabsPanes from './tabs-panes.component';

const TabsPlugin: Plugin = {
  install(app: App): void {
    registerComponent(app, VuiTabs);
    registerComponent(app, VuiTabItem);
    registerComponent(app, VuiTabsPanes);
    registerComponent(app, VuiTabsNav);
  }
};

export default TabsPlugin;

export {
  VuiTabs,
  VuiTabItem
};
