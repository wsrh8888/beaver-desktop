import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('renderModule/login/views/login/index.vue'),
  },
  {
    path: '/register',
    component: () => import('renderModule/login/views/register/index.vue'),
  },
  {
    path: '/forgot',
    component: () => import('renderModule/login/views/forgot/index.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
