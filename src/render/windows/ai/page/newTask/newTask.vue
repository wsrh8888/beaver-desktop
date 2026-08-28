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
  <div class="ai-new-task">
    <AiWelcome
      v-model="inputMessage"
      @send="handleSend"
      @pick-tag="handlePickTag"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AiWelcome from 'renderModule/windows/ai/components/welcome/index.vue'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

/**
 * ai-new-task：点「新建任务」进入。
 * 不选空间 → 云端「任务」；选本机空间 → 该空间下「会话」。
 */
export default defineComponent({
  name: 'AiNewTaskPage',
  components: { AiWelcome },
  setup() {
    const router = useRouter()
    const aiChatStore = useAiChatStore()
    const aiViewStore = useAiViewStore()
    const inputMessage = ref('')

    const resetCompose = () => {
      aiChatStore.startNewTask()
      inputMessage.value = ''
    }

    resetCompose()
    watch(() => aiViewStore.composeEpoch, resetCompose)

    const handleSend = () => {
      const text = inputMessage.value.trim()
      if (!text)
        return
      // 发送：无空间→云端任务；有空间→本机空间会话
      const taskId = aiChatStore.sendTextMessage(text)
      inputMessage.value = ''
      if (taskId)
        router.replace({ name: 'task', params: { id: taskId } })
    }

    const handlePickTag = (tag: string) => {
      inputMessage.value = `帮我处理：${tag}`
    }

    return {
      inputMessage,
      handleSend,
      handlePickTag,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-new-task {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
