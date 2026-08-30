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
  <div class="ai-chat">
    <div class="ai-chat__left">
      <AiChatPanel
        :title="aiChatStore.currentChat?.title || '会话'"
        :messages="aiChatStore.currentChat?.messages ?? []"
      />
    </div>
    <div v-if="aiViewStore.resultPanelOpen" class="ai-chat__right">
      <AiResultPanel />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiChatPanel from './left-components/index.vue'
import AiResultPanel from './right-component/index.vue'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

/** 已发起会话：左侧对话 + 右侧产物（对齐 WorkBuddy 执行态） */
export default defineComponent({
  name: 'AiChatPage',
  components: { AiChatPanel, AiResultPanel },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const aiChatStore = useAiChatStore()
    const aiViewStore = useAiViewStore()

    const syncChat = (id: string) => {
      const ok = aiChatStore.openChat(id)
      if (!ok)
        router.replace({ name: 'newTask' })
    }

    onMounted(() => {
      syncChat(String(route.params.id || ''))
    })

    watch(
      () => route.params.id,
      (id) => {
        if (id)
          syncChat(String(id))
      },
    )

    return {
      aiChatStore,
      aiViewStore,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-chat {
  height: 100%;
  display: flex;
  min-width: 0;
  overflow: hidden;

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__right {
    flex-shrink: 0;
  }
}
</style>
