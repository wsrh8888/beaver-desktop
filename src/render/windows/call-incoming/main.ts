import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
// import notificationManager from './notification-manager'
import 'renderModule/utils/init/window'
import 'renderModule/assets/style/index.less'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// notificationManager.init()

app.mount('#app')
