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
  <AiLayout :show-left="aiViewStore.isTextMode">
    <template #mode>
      <AiModeBar v-if="aiViewStore.isChatView" />
    </template>
    <template v-if="aiViewStore.isTextMode" #left>
      <AiViewLeft
        :chat-list="aiChatStore.chatList"
        :current-chat-id="aiChatStore.currentChatId"
        :is-skill-view="aiViewStore.isSkillView"
        @new-chat="handleNewChat"
        @select="handleSelectChat"
        @open-skill-store="aiViewStore.openSkillStore('plaza')"
      />
    </template>
    <template #main>
      <AiSkillView v-if="aiViewStore.isSkillView" />
      <AiTextView
        v-else-if="aiViewStore.isTextMode"
        v-model:input-value="inputMessage"
        @send="handleSendText"
      />
      <AiVoiceView v-else />
    </template>
  </AiLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import AiLayout from 'renderModule/windows/ai/components/layout/index.vue'
import AiModeBar from 'renderModule/windows/ai/components/modeBar.vue'
import AiViewLeft from 'renderModule/windows/ai/view/left/index.vue'
import AiTextView from 'renderModule/windows/ai/view/text/index.vue'
import AiVoiceView from 'renderModule/windows/ai/view/voice/index.vue'
import AiSkillView from 'renderModule/windows/ai/view/skill/index.vue'
import { useAiChatStore } from 'renderModule/windows/ai/store/chat'
import { useAiSkillStore } from 'renderModule/windows/ai/store/skill'
import { useAiViewStore } from 'renderModule/windows/ai/store/view'

export default defineComponent({
  name: 'AiApp',
  components: {
    AiLayout,
    AiModeBar,
    AiViewLeft,
    AiTextView,
    AiVoiceView,
    AiSkillView,
  },
  setup() {
    const aiChatStore = useAiChatStore()
    const aiSkillStore = useAiSkillStore()
    const aiViewStore = useAiViewStore()
    const inputMessage = ref('')

    const handleNewChat = () => {
      aiViewStore.closeSkillStore()
      aiChatStore.startNewChat(aiSkillStore.activeSkillId)
    }

    const handleSelectChat = (id: string) => {
      aiViewStore.closeSkillStore()
      aiChatStore.selectChat(id)
    }

    const handleSendText = () => {
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
      handleNewChat,
      handleSelectChat,
      handleSendText,
    }
  },
})
</script>

<style lang="less" scoped>
</style>
