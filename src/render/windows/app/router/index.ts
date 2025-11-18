import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/message',
  },
  {
    path: '/message',
    component: () => import('renderModule/windows/app/page/message/message.vue'),
  },
  {
    path: '/friend',
    component: () => import('renderModule/windows/app/page/friend/friend.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
