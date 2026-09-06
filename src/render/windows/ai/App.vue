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
  <div class="ai-app">
    <AiHeader />
    <div class="ai-app__body">
      <AiSidebar v-if="!aiViewStore.sidebarCollapsed" />
      <main class="ai-app__main">
        <router-view />
      </main>
    </div>
    <AiGlobalPage />
  </div>
</template>

<script lang="ts">
import Logger from 'renderModule/utils/logger';
const logger = new Logger('App')

import { defineComponent, onMounted } from 'vue'
import AiHeader from 'renderModule/windows/ai/components/layout/header/header.vue'
import AiSidebar from 'renderModule/windows/ai/components/layout/sidebar/index.vue'
import AiGlobalPage from 'renderModule/windows/ai/page/global/index.vue'
import { useAiAgentStore } from 'renderModule/windows/ai/pinia/agent'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

export default defineComponent({
  name: 'AiApp',
  components: { AiHeader, AiSidebar, AiGlobalPage },
  setup() {
    logger.info({ text: 'setup 开始' })
    const aiViewStore = useAiViewStore()
    const aiAgentStore = useAiAgentStore()

    onMounted(() => {
      aiAgentStore.ensureAgent().catch(() => {
        // 创建失败时发消息再重试
      })
    })

    return { aiViewStore }
  },
})
</script>

<style lang="less" scoped>
.ai-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;

  &__body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  &__main {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    background: #FFFFFF;
  }
}
</style>
