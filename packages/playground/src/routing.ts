import { Component } from 'vue';

import introDoc from '../../vitamin/Readme.md';
import alertDoc from '../../vitamin/src/components/alert/examples/Alert.md';

declare type Menu = {
  name: string;
  filePath: Component;
  path: string;
};

declare type SubMenu = {
  name: string;
  children: Array<Menu>;
};

const routeConfig: Array<SubMenu> = [
  {
    children: [{
      filePath: introDoc,
      name: 'introduction',
      path: 'intro'
    }],
    name: 'get-start'
  },
  {
    children: [{
      filePath: alertDoc,
      name: 'alert',
      path: 'alert'
    }],
    name: 'components'
  }
];

export {
  routeConfig
};

export default routeConfig
  .reduce((prev: Array<Menu>, current: SubMenu): Array<Menu> => [...prev, ...current.children], [])
  .map((demo: Menu) => {
    const {path} = demo;
    return {
      component: demo.filePath,
      name,
      path: `${path?.toLowerCase()}`
    };
  });
