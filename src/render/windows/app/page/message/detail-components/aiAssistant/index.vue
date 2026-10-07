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
  <div>
    <div class="ai-assistant-sidebar" :class="{ active: isVisible }">
      <div class="sidebar-header">
        <div class="header-titles">
          <h3>AI 助手</h3>
          <span class="session-name">{{ sessionTitle }}</span>
        </div>
        <button class="close-sidebar" type="button" @click="closeDetails">
          <img src="renderModule/assets/image/private/close.svg" alt="关闭">
        </button>
      </div>

      <div ref="listRef" class="message-list">
        <div v-if="!messages.length" class="empty-hint">
          可就当前会话提问：总结、起草回复、查找要点等
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg-row"
          :class="msg.role === 'user' ? 'is-user' : 'is-assistant'"
        >
          <div class="msg-bubble">
            <span class="msg-text">{{ msg.content || (msg.streaming ? '…' : '') }}</span>
            <span v-if="msg.streaming" class="streaming-dot" />
          </div>
        </div>
      </div>

      <div class="composer">
        <BeaverInput
          v-model="draft"
          placeholder="问 AI…"
          :disabled="streaming"
          @keydown="onKeydown"
        />
        <BeaverButton
          type="primary"
          size="small"
          :disabled="!draft.trim() || streaming"
          :loading="streaming"
          @click="handleSend"
        >
          发送
        </BeaverButton>
      </div>
    </div>

    <div class="overlay" :class="{ active: isVisible }" @click="closeDetails" />
  </div>
</template>

<script lang="ts">
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverInput from 'renderModule/components/ui/input/Input.vue'
import { useChatAiAssistantStore } from 'renderModule/windows/app/pinia/chatAiAssistant'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import Logger from 'renderModule/utils/logger'
import { computed, defineComponent, nextTick, ref, watch } from 'vue'

const logger = new Logger('AiAssistantSidebar')

export default defineComponent({
  name: 'AiAssistantSidebar',
  components: {
    BeaverInput,
    BeaverButton,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()
    const aiStore = useChatAiAssistantStore()

    const isVisible = ref(props.visible)
    const draft = ref('')
    const listRef = ref<HTMLElement | null>(null)

    const imConversationId = computed(() => messageViewStore.currentChatId || '')

    const sessionTitle = computed(() => {
      const id = imConversationId.value
      if (!id)
        return '当前会话'
      const info = conversationStore.getConversationInfo(id)
      return info?.nickName || '当前会话'
    })

    const messages = computed(() => aiStore.messagesOf(imConversationId.value))
    const streaming = computed(() => aiStore.isStreaming(imConversationId.value))

    const scrollToBottom = async () => {
      await nextTick()
      const el = listRef.value
      if (el)
        el.scrollTop = el.scrollHeight
    }

    watch(() => props.visible, (v) => {
      isVisible.value = v
    })

    watch(messages, () => {
      void scrollToBottom()
    }, { deep: true })

    const closeDetails = () => {
      logger.info({ text: '关闭 AI 侧栏' })
      messageViewStore.setAiAssistantShow(false)
      emit('close')
    }

    const handleSend = async () => {
      const text = draft.value.trim()
      const id = imConversationId.value
      if (!text || !id || streaming.value)
        return
      draft.value = ''
      await aiStore.sendText(id, text)
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    }

    return {
      isVisible,
      draft,
      listRef,
      sessionTitle,
      messages,
      streaming,
      closeDetails,
      handleSend,
      onKeydown,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-assistant-sidebar {
  position: fixed;
  top: 0;
  right: -380px;
  width: 380px;
  height: 100%;
  background-color: #FFFFFF;
  border-left: 1px solid #EBEEF5;
  z-index: 100;
  transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);

  &.active {
    right: 0;
  }

  .sidebar-header {
    height: 64px;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;

    .header-titles {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #2D3436;
      }

      .session-name {
        font-size: 12px;
        color: #636E72;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 280px;
      }
    }

    .close-sidebar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: none;
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      img {
        width: 20px;
        height: 20px;
      }
    }
  }

  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(178, 190, 195, 0.5);
      border-radius: 3px;
    }

    .empty-hint {
      margin: auto;
      padding: 24px 16px;
      text-align: center;
      font-size: 13px;
      color: #B2BEC3;
      line-height: 1.6;
    }

    .msg-row {
      display: flex;

      &.is-user {
        justify-content: flex-end;

        .msg-bubble {
          background: #FFE6D9;
          color: #2D3436;
        }
      }

      &.is-assistant {
        justify-content: flex-start;

        .msg-bubble {
          background: #F5F6FA;
          color: #2D3436;
        }
      }

      .msg-bubble {
        max-width: 88%;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
        white-space: pre-wrap;
        position: relative;

        .streaming-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin-left: 4px;
          border-radius: 50%;
          background: #FF7D45;
          animation: pulse 1s ease-in-out infinite;
        }
      }
    }
  }

  .composer {
    flex-shrink: 0;
    border-top: 1px solid #EBEEF5;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.beaver-input) {
      flex: 1;
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;

  &.active {
    opacity: 1;
    pointer-events: auto;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
  }

  50% {
    opacity: 1;
  }
}
</style>
