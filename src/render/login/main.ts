import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import "renderModule/utils/init/window"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import router from './router'
import "renderModule/assets/style/index.less"
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// app.use(router)
app.mount('#app')
