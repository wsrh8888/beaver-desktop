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
  <div class="circle-app">
    <CircleHeader @refresh="handleRefresh" />
    <CirclePage ref="pageRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import CircleHeader from 'renderModule/windows/circle/components/header/index.vue'
import CirclePage from 'renderModule/windows/circle/page/circle/index.vue'

export default defineComponent({
  name: 'CircleApp',
  components: {
    CircleHeader,
    CirclePage,
  },
  setup() {
    const pageRef = ref<{ refresh: () => Promise<void> } | null>(null)

    const handleRefresh = () => {
      pageRef.value?.refresh()
    }

    return {
      pageRef,
      handleRefresh,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}
</style>
