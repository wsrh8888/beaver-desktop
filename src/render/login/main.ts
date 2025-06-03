import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import "renderModule/utils/init/window"
import router from './router'
import "renderModule/assets/style/index.less"
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')
