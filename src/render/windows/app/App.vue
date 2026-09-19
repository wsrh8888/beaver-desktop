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
  <div class="app__container">
    <HeaderComponent />
    <Sidebar class="app__sidebar app__drag" />

    <div class="app__content">
      <router-view />
    </div>
    <GlobalComponent />
  </div>
</template>

<script lang="ts">
import GlobalComponent from 'renderModule/windows/app/components/global/index.vue'
import HeaderComponent from 'renderModule/windows/app/components/layout/header/header.vue'
import Sidebar from 'renderModule/windows/app/components/layout/sidebar/index.vue'
import { useAppStore } from 'renderModule/windows/app/pinia/app/app'
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  components: {
    Sidebar,
    HeaderComponent,
    GlobalComponent,
  },
  setup() {
    const appStore = useAppStore()

    onMounted(() => {
      // 初始化应用数据（异步，不阻塞UI渲染）
      appStore.initApp()
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
.app__container {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .app__sidebar {
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
  }

  .app__content {
    flex: 1;
    margin-left: 66px;
    overflow: hidden;
  }
}
</style>
