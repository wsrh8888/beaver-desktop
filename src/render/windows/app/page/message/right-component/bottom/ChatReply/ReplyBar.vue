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
  <div v-if="messageViewStore.replyingTo" class="reply-bar" :style="{ bottom: messageViewStore.inputHeight + 'px' }">
    <div class="reply-info">
      <span class="reply-label">回复 {{ messageViewStore.replyingTo.sender.nickName }}：</span>
      <span class="reply-preview">{{ previewText }}</span>
    </div>
    <button class="reply-close" @click="messageViewStore.setReplyingTo(null)">
      ×
    </button>
  </div>
</template>

<script lang="ts">
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message/index'
import { MessageType } from 'commonModule/type/ajax/chat'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'ReplyBar',
  setup() {
    const messageViewStore = useMessageViewStore()

    const previewText = computed(() => {
      const msg = messageViewStore.replyingTo?.msg
      if (!msg) return ''

      switch (msg.type) {
        case MessageType.TEXT:
          return msg.textMsg?.content?.slice(0, 50) || '[文本]'
        case MessageType.IMAGE:
          return '[图片]'
        case MessageType.VIDEO:
          return '[视频]'
        case MessageType.FILE:
          return '[文件]'
        case MessageType.VOICE:
          return '[语音]'
        case MessageType.EMOJI:
          return '[表情]'
        case MessageType.AUDIO_FILE:
          return '[音频]'
        default:
          return '[消息]'
      }
    })

    return {
      messageViewStore,
      previewText
    }
  },
})
</script>

<style lang="less" scoped>
.reply-bar {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #F5F6FA;
  border-left: 3px solid #FF7D45;
  border-top: 1px solid #EBEEF5;
  gap: 8px;
  z-index: 10;

  .reply-info {
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    gap: 4px;
    align-items: center;

    .reply-label {
      color: #FF7D45;
      flex-shrink: 0;
      font-weight: 500;
    }

    .reply-preview {
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .reply-close {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #909399;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #606266;
    }
  }
}
</style>
