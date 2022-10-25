import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from 'vue-router';

// @ts-expect-error
const pages = import.meta.glob('../pages/*.vue');
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\.\/pages\/(.*)\.vue$/)[1].toLowerCase();
  const routePath = `/${name}`;
  if (routePath === '/home') {
    return {
      path: '/',
      name,
      component: pages[path],
    };
  }
  return {
    path: routePath,
    name,
    component: pages[path],
  };
});

export function createRouter() {
  return _createRouter({
    // @ts-ignore
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });
}
