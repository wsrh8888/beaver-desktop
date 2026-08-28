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
  <div class="ai-chat-panel">
    <AiChatHeader :title="title" />
    <AiChatContent :messages="messages" />
    <div class="ai-chat-panel__composer">
      <AiComposer
        :model-value="modelValue"
        :show-meta="false"
        compact
        @update:model-value="$emit('update:modelValue', $event)"
        @send="$emit('send')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiComposer from 'renderModule/windows/ai/components/composer/index.vue'
import type { IAiMessage } from 'renderModule/windows/ai/types/chat'
import AiChatContent from './content.vue'
import AiChatHeader from './header.vue'

export default defineComponent({
  name: 'AiChatPanel',
  components: { AiChatHeader, AiChatContent, AiComposer },
  props: {
    title: { type: String, default: '海狸助手' },
    messages: { type: Array as () => IAiMessage[], default: () => [] },
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'send'],
})
</script>

<style lang="less" scoped>
.ai-chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #FFFFFF;

  &__composer {
    padding: 16px 24px;
    border-top: 1px solid #EBEEF5;
    flex-shrink: 0;
  }
}
</style>
