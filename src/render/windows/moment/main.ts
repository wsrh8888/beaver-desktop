import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import 'renderModule/utils/init/window'
import 'renderModule/assets/style/index.less'
import 'renderModule/utils/request/ajax'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
