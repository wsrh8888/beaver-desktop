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
  <div class="ai-chat-content">
    <div
      v-for="message in messages"
      :key="message.id"
      class="ai-chat-content__row"
      :class="{ mine: message.role === 'user' }"
    >
      <div class="ai-chat-content__avatar">
        <img
          v-if="message.role === 'user'"
          src="renderModule/assets/image/ai/user.svg"
          alt="user"
        >
        <img
          v-else
          src="renderModule/assets/image/assistant/avatar.svg"
          alt="ai"
        >
      </div>
      <div class="ai-chat-content__bubble">
        <div class="ai-chat-content__text">
          {{ message.content }}<span v-if="message.streaming" class="ai-chat-content__cursor">|</span>
        </div>
        <div class="ai-chat-content__time">
          {{ formatChatTime(message.timestamp) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { IAiMessage } from 'renderModule/windows/ai/types/chat'
import { formatChatTime } from 'renderModule/windows/ai/utils/formatTime'

export default defineComponent({
  name: 'AiChatContent',
  props: {
    messages: {
      type: Array as () => IAiMessage[],
      default: () => [],
    },
  },
  setup() {
    return { formatChatTime }
  },
})
</script>

<style lang="less" scoped>
.ai-chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #F9FAFB;

  &__row {
    display: flex;
    margin-bottom: 12px;

    &.mine {
      flex-direction: row-reverse;

      .ai-chat-content__bubble {
        background: #FFE6D9;
        border-radius: 12px 4px 12px 12px;
      }
    }

    &:not(.mine) .ai-chat-content__bubble {
      background: #F9FAFB;
      border: 1px solid #EBEEF5;
      border-radius: 4px 12px 12px 12px;
      background: #FFFFFF;
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    margin: 0 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    border: 1px solid #EBEEF5;

    img {
      width: 24px;
      height: 24px;
    }
  }

  &__bubble {
    max-width: 70%;
    padding: 12px;
  }

  &__text {
    font-size: 13px;
    line-height: 1.5;
    color: #2D3436;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 8px;
  }

  &__cursor {
    color: #FF7D45;
    animation: blink 1s step-end infinite;
  }

  &__time {
    font-size: 11px;
    color: #B2BEC3;
    text-align: right;
  }
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
