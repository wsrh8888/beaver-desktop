import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    "path": "/",
    "redirect": "/login"
  },
  {
    path: '/login',
    component: () => import("renderModule/login/views/login/index.vue")
  },
  {
    path: '/register',
    component: () => import("renderModule/login/views/register/index.vue")
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes: routes
})
