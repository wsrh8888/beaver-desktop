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
  <div class="ai-text-view">
    <AiRightHeader :title="currentChat?.title || '海狸助手'" />
    <AiRightContent :messages="currentChat?.messages ?? []" />
    <AiRightBottom
      :input-value="inputValue"
      @update:input-value="$emit('update:inputValue', $event)"
      @send="$emit('send')"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useAiChatStore } from 'renderModule/windows/ai/store/chat'
import AiRightHeader from 'renderModule/windows/ai/view/right/header/header.vue'
import AiRightContent from 'renderModule/windows/ai/view/right/content/content.vue'
import AiRightBottom from 'renderModule/windows/ai/view/right/bottom/index.vue'

export default defineComponent({
  name: 'AiTextView',
  components: {
    AiRightHeader,
    AiRightContent,
    AiRightBottom,
  },
  props: {
    inputValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:inputValue', 'send'],
  setup() {
    const aiChatStore = useAiChatStore()
    const currentChat = computed(() => aiChatStore.currentChat)

    return {
      currentChat,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-text-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
