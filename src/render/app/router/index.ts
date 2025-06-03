import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/message'
  },
  {
    path: '/message',
    component: () => import("renderModule/app/page/message/message.vue")
  },
  {
    path: '/friend',
    component: () => import("renderModule/app/page/friend/friend.vue")
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes: routes
})
