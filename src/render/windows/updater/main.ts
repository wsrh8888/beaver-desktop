import { createApp } from 'vue'
import App from './App.vue'
import 'renderModule/utils/init/window'
import 'renderModule/assets/style/index.less'

const app = createApp(App)
app.mount('#app')
