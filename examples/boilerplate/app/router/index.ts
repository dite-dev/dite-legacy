import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from 'vue-router';
import About from '../pages/about';
import Category from '../pages/category.vue';
import Index from '../pages/index';

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/category',
    name: 'Category',
    component: Category,
  },
];

export function createRouter() {
  return _createRouter({
    // @ts-ignore
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });
}
