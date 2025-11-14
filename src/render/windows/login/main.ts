import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'renderModule/utils/init/window'
import 'renderModule/assets/style/index.less'
import './utils/rem/rem'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')
