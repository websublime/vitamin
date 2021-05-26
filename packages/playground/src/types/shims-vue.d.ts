/* eslint-disable */

declare module '*.md' {
  import type { Component } from 'vue';
  const component: Component;
  export default component;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
