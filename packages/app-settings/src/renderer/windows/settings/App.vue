<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<template>
  <div class="settings-app">
    <SettingsHeader />
    <SettingsLayout />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import SettingsHeader from './components/layout/header.vue'
import SettingsLayout from './components/layout/settingsLayout.vue'
import { useSettingsStore } from './pinia/settings'

export default defineComponent({
  name: 'SettingsApp',
  components: {
    SettingsHeader,
    SettingsLayout,
  },
  setup() {
    const settingsStore = useSettingsStore()

    onMounted(() => {
      settingsStore.init()
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
.settings-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}
</style>
