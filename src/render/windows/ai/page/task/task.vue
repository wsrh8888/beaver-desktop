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
  <div class="ai-task">
    <div class="ai-task__chat">
      <AiChatPanel
        v-model="inputMessage"
        :title="aiChatStore.currentTask?.title || '任务'"
        :messages="aiChatStore.currentTask?.messages ?? []"
        @send="handleSend"
      />
    </div>
    <AiResultPanel v-if="aiViewStore.resultPanelOpen" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiChatPanel from 'renderModule/windows/ai/components/chatPanel/index.vue'
import AiResultPanel from 'renderModule/windows/ai/components/resultPanel/index.vue'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

/** 已发起任务：对话区 + 结果区（对齐 WorkBuddy 执行态） */
export default defineComponent({
  name: 'AiTaskPage',
  components: { AiChatPanel, AiResultPanel },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const aiChatStore = useAiChatStore()
    const aiViewStore = useAiViewStore()
    const inputMessage = ref('')

    const syncTask = (id: string) => {
      const ok = aiChatStore.openTask(id)
      if (!ok)
        router.replace({ name: 'newTask' })
    }

    onMounted(() => {
      syncTask(String(route.params.id || ''))
    })

    watch(
      () => route.params.id,
      (id) => {
        if (id)
          syncTask(String(id))
      },
    )

    const handleSend = () => {
      const text = inputMessage.value.trim()
      if (!text)
        return
      aiChatStore.sendTextMessage(text)
      inputMessage.value = ''
    }

    return {
      aiChatStore,
      aiViewStore,
      inputMessage,
      handleSend,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-task {
  height: 100%;
  display: flex;
  min-width: 0;
  overflow: hidden;

  &__chat {
    flex: 1;
    min-width: 0;
  }
}
</style>
