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
  <div class="workbench-app">
    <WorkbenchHeader @refresh="handleRefresh" />
    <WorkbenchTabs />
    <div class="workbench-app-body">
      <WorkbenchViewer />
      <WorkbenchGrid v-show="workbenchStore.isHomeTab" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import WorkbenchGrid from 'renderModule/windows/workbench/components/grid/index.vue'
import WorkbenchHeader from 'renderModule/windows/workbench/components/header/index.vue'
import WorkbenchTabs from 'renderModule/windows/workbench/components/tabs/index.vue'
import WorkbenchViewer from 'renderModule/windows/workbench/components/viewer/index.vue'
import { useWorkbenchStore } from 'renderModule/windows/workbench/store/workbench/workbench'

export default defineComponent({
  name: 'WorkbenchApp',
  components: {
    WorkbenchHeader,
    WorkbenchTabs,
    WorkbenchGrid,
    WorkbenchViewer,
  },
  setup() {
    const workbenchStore = useWorkbenchStore()

    const handleRefresh = () => {
      if (workbenchStore.isHomeTab)
        workbenchStore.loadApps()
      else if (workbenchStore.activeTabId)
        window.dispatchEvent(new CustomEvent('workbench-viewer-refresh'))
    }

    onMounted(() => {
      workbenchStore.loadApps()
    })

    return {
      workbenchStore,
      handleRefresh,
    }
  },
})
</script>

<style lang="less" scoped>
.workbench-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}

.workbench-app-body {
  position: relative;
  flex: 1;
  min-height: 0;
}
</style>
