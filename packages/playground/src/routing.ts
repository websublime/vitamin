import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: '/home'
  },
  {
    component: () => import(/* webpackChunkName: "group-home" */ './modules/home/home.scene.vue'),
    name: 'Home',
    path: '/home'
  },
  {
    children: [
      {
        component: () => import(/* webpackChunkName: "group-config" */ './modules/config/config.scene.vue'),
        name: 'Config',
        path: ''
      },
      {
        component: () => import(/* webpackChunkName: "group-alert" */ './modules/alert/alert.scene.vue'),
        name: 'Alert',
        path: 'alert'
      },
      {
        component: () => import(/* webpackChunkName: "group-button" */ './modules/button/button.scene.vue'),
        name: 'Button',
        path: 'button'
      },
      {
        component: () => import(/* webpackChunkName: "group-card" */ './modules/card/card.scene.vue'),
        name: 'Card',
        path: 'card'
      },
      {
        component: () => import(/* webpackChunkName: "group-tabs" */ './modules/tabs/tabs.scene.vue'),
        name: 'Tabs',
        path: 'tabs'
      }
    ],
    component: () => import(/* webpackChunkName: "group-docs" */ './modules/documentation/documentation.container.vue'),
    path: '/docs'
  }
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'vt-link-active',
  linkExactActiveClass: 'vt-exact-link-active',
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});
