import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import notificationManager from './notification-manager'
import router from './router'
import 'renderModule/utils/init/window'
import 'renderModule/assets/style/index.less'
import './utils/rem'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
notificationManager.init()
app.use(router)
app.mount('#app')
