import introDoc from '@websublime/vitamin/Readme.md';
import alertDoc from '@websublime/vitamin/src/components/alert/examples/Alert.md';
import buttonDoc from '@websublime/vitamin/src/components/button/examples/Button.md';
import buttonGroupDoc from '@websublime/vitamin/src/components/button-group/examples/ButtonGroup.md';
import { Component } from 'vue';

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
    children: [
      {
        filePath: alertDoc,
        name: 'alert',
        path: 'alert'
      },
      {
        filePath: buttonDoc,
        name: 'button',
        path: 'button'
      },
      {
        filePath: buttonGroupDoc,
        name: 'button-group',
        path: 'button-group'
      }
    ],
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
