import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/message',
    component: () => import("renderModule/app/page/message/message.vue")
  },
  {
    path: '/contact',
    component: () => import("renderModule/app/page/contact/contact.vue")
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes: routes
})
