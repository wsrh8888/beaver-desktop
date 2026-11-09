/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { initWindow } from '@beaver-im/beaver/renderer'
import App from './App.vue'
import '@beaver-im/beaver/renderer.css'

initWindow()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
