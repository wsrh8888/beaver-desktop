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
  <div class="ai-assistant app__no_drag">
    <aside
      class="ai-assistant__panel"
      :class="{ 'ai-assistant__panel--active': isVisible }"
    >
      <!-- 顶部 -->
      <header class="ai-assistant__header">
        <div class="ai-assistant__brand">
          <span class="ai-assistant__brand-icon">
            <img src="renderModule/assets/image/leftBar/assistant_active.svg" alt="">
          </span>
          <div class="ai-assistant__brand-text">
            <h3>AI 助手</h3>
            <span class="ai-assistant__context" :title="sessionTitle">
              就「{{ sessionTitle }}」提问
            </span>
          </div>
        </div>
        <button class="ai-assistant__close" type="button" title="关闭" @click="closeDetails">
          <img src="renderModule/assets/image/common/close.svg" alt="关闭">
        </button>
      </header>

      <!-- 消息区 -->
      <div ref="listRef" class="ai-assistant__body">
        <!-- 空态：引导 + 快捷提问 -->
        <div v-if="!messages.length" class="ai-assistant__empty">
          <div class="ai-assistant__empty-icon">
            <img src="renderModule/assets/image/ai/robot.svg" alt="">
          </div>
          <p class="ai-assistant__empty-title">和这个会话聊聊</p>
          <p class="ai-assistant__empty-desc">我可以帮你总结内容、起草回复、梳理要点</p>
          <div class="ai-assistant__prompts">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              type="button"
              class="ai-assistant__prompt"
              @click="sendPrompt(prompt)"
            >
              {{ prompt }}
              <span class="ai-assistant__prompt-arrow">→</span>
            </button>
          </div>
        </div>

        <!-- 对话 -->
        <div v-else class="ai-assistant__thread">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="ai-assistant__msg"
            :class="msg.role === 'user' ? 'is-user' : 'is-assistant'"
          >
            <span v-if="msg.role === 'assistant'" class="ai-assistant__avatar">
              <img src="renderModule/assets/image/leftBar/assistant_active.svg" alt="">
            </span>
            <div class="ai-assistant__bubble">
              <span class="ai-assistant__text">{{ msg.content || (msg.streaming ? '' : '—') }}</span>
              <span v-if="msg.streaming" class="ai-assistant__typing" aria-label="生成中">
                <i /><i /><i />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <footer class="ai-assistant__composer">
        <div class="ai-assistant__input-wrap" :class="{ 'is-focused': inputFocused }">
          <textarea
            ref="inputRef"
            v-model="draft"
            class="ai-assistant__input"
            rows="1"
            placeholder="问点什么…"
            :disabled="streaming"
            @keydown="onKeydown"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @input="autoResize"
          />
          <button
            class="ai-assistant__send"
            type="button"
            :class="{ 'is-ready': canSend }"
            :disabled="!canSend"
            title="发送"
            @click="handleSend"
          >
            <img src="renderModule/assets/image/moment/send.svg" alt="发送">
          </button>
        </div>
        <p class="ai-assistant__hint">
          <span>Enter 发送</span>
          <span class="ai-assistant__hint-sep">·</span>
          <span>Shift + Enter 换行</span>
        </p>
      </footer>
    </aside>

    <div
      class="ai-assistant__overlay"
      :class="{ 'ai-assistant__overlay--active': isVisible }"
      @click="closeDetails"
    />
  </div>
</template>

<script lang="ts">
import { useChatAiAssistantStore } from 'renderModule/windows/app/pinia/chatAiAssistant'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import Logger from 'renderModule/utils/logger'
import { computed, defineComponent, nextTick, ref, watch } from 'vue'

const logger = new Logger('AiAssistantSidebar')

const QUICK_PROMPTS = [
  '总结一下这个会话',
  '帮我起草一条回复',
  '提取其中的关键信息',
]

export default defineComponent({
  name: 'AiAssistantSidebar',
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
    const inputFocused = ref(false)
    const listRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLTextAreaElement | null>(null)
    const quickPrompts = QUICK_PROMPTS

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
    const canSend = computed(() => !!draft.value.trim() && !streaming.value && !!imConversationId.value)

    const scrollToBottom = async () => {
      await nextTick()
      const el = listRef.value
      if (el)
        el.scrollTop = el.scrollHeight
    }

    const autoResize = () => {
      const el = inputRef.value
      if (!el)
        return
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }

    const resetInput = () => {
      draft.value = ''
      nextTick(autoResize)
    }

    watch(() => props.visible, (v) => {
      isVisible.value = v
      if (v) {
        void scrollToBottom()
        nextTick(() => inputRef.value?.focus())
      }
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
      resetInput()
      await aiStore.sendText(id, text)
    }

    const sendPrompt = (prompt: string) => {
      draft.value = prompt
      void handleSend()
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault()
        void handleSend()
      }
    }

    return {
      isVisible,
      draft,
      inputFocused,
      listRef,
      inputRef,
      quickPrompts,
      sessionTitle,
      messages,
      streaming,
      canSend,
      closeDetails,
      handleSend,
      sendPrompt,
      onKeydown,
      autoResize,
    }
  },
})
</script>

<style lang="less" scoped>
@brand: #FF7D45;
@brand-soft: #FFF1EA;
@text: #2D3436;
@text-sub: #8A9196;
@line: #ECEEF0;
@surface: #FFFFFF;
@canvas: #FAFBFC;

.ai-assistant {
  font-family: inherit;
  color: @text;
}

.ai-assistant__panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100%;
  background: @surface;
  z-index: 100;
  display: flex;
  flex-direction: column;
  transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);

  &--active {
    right: 0;
  }
}

/* 顶部 */
.ai-assistant__header {
  flex-shrink: 0;
  height: 68px;
  padding: 0 20px;
  border-bottom: 1px solid @line;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-assistant__brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.ai-assistant__brand-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: @brand-soft;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 20px;
    height: 20px;
  }
}

.ai-assistant__brand-text {
  min-width: 0;

  h3 {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
    color: @text;
  }
}

.ai-assistant__context {
  display: block;
  font-size: 12px;
  color: @text-sub;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.ai-assistant__close {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #F3F4F6;
  }

  img {
    width: 18px;
    height: 18px;
  }
}

/* 消息区 */
.ai-assistant__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: @canvas;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(178, 190, 195, 0.5);
    border-radius: 3px;
  }
}

.ai-assistant__empty {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 28px;
  text-align: center;
}

.ai-assistant__empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: @brand-soft;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  img {
    width: 28px;
    height: 28px;
    color: @brand;
  }
}

.ai-assistant__empty-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: @text;
}

.ai-assistant__empty-desc {
  margin: 0 0 24px;
  font-size: 13px;
  line-height: 1.6;
  color: @text-sub;
}

.ai-assistant__prompts {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-assistant__prompt {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid @line;
  border-radius: 10px;
  background: @surface;
  color: @text;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: @brand;
    background: @brand-soft;
  }
}

.ai-assistant__prompt-arrow {
  color: @brand;
  font-size: 15px;
  opacity: 0;
  transition: opacity 0.15s;

  .ai-assistant__prompt:hover & {
    opacity: 1;
  }
}

.ai-assistant__thread {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-assistant__msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;

  &.is-user {
    justify-content: flex-end;

    .ai-assistant__bubble {
      background: @brand;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
  }

  &.is-assistant {
    .ai-assistant__bubble {
      background: @surface;
      color: @text;
      border: 1px solid @line;
      border-bottom-left-radius: 4px;
    }
  }
}

.ai-assistant__avatar {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: 8px;
  background: @brand-soft;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
  }
}

.ai-assistant__bubble {
  max-width: calc(100% - 36px);
  padding: 10px 13px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.65;
}

.ai-assistant__text {
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-assistant__typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 16px;
  margin-left: 2px;

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: @brand;
    animation: ai-bounce 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

/* 输入区 */
.ai-assistant__composer {
  flex-shrink: 0;
  padding: 12px 16px 10px;
  border-top: 1px solid @line;
  background: @surface;
}

.ai-assistant__input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  border: 1px solid @line;
  border-radius: 12px;
  background: @canvas;
  transition: border-color 0.15s, background 0.15s;

  &.is-focused {
    border-color: @brand;
    background: @surface;
  }
}

.ai-assistant__input {
  flex: 1;
  min-width: 0;
  min-height: 22px;
  max-height: 120px;
  padding: 0;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: @text;
  font-family: inherit;
  font-size: 13px;
  line-height: 22px;

  &::placeholder {
    color: #B2BEC3;
  }
}

.ai-assistant__send {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  border-radius: 9px;
  background: #E6E8EA;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  img {
    width: 16px;
    height: 16px;
    filter: grayscale(1) brightness(1.6);
  }

  &.is-ready {
    background: @brand;
    cursor: pointer;

    img {
      filter: none;
    }

    &:hover {
      background: #F06A32;
    }
  }
}

.ai-assistant__hint {
  margin: 7px 2px 0;
  font-size: 11px;
  color: #B2BEC3;
  display: flex;
  gap: 5px;
}

.ai-assistant__hint-sep {
  color: #D5D9DC;
}

/* 遮罩 */
.ai-assistant__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.3s, visibility 0.3s;

  &--active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

@keyframes ai-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}
</style>
