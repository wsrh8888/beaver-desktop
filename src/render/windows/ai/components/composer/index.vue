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
  <div class="ai-composer" :class="{ compact }">
    <div class="ai-composer__card">
      <textarea
        v-model="draft"
        class="ai-composer__textarea"
        :placeholder="placeholder"
        rows="3"
        :disabled="sending"
        @keydown="onKeydown"
      />
      <div class="ai-composer__toolbar">
        <div class="ai-composer__right">
          <AiModelPicker />
          <button
            class="ai-composer__send"
            type="button"
            :disabled="sending || !draft.trim()"
            @click="handleSend"
          >
            <img src="renderModule/assets/image/assistant/send.svg" alt="发送">
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMeta" class="ai-composer__meta">
      <slot name="meta" />
      <button class="ai-composer__meta-btn" type="button">
        <img src="renderModule/assets/image/common/help.svg" alt="permission">
        默认权限
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import AiModelPicker from './components/modelPicker/index.vue'
import Logger from 'renderModule/utils/logger'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'

const logger = new Logger('AiComposer')

/**
 * 输入区业务组件：发送统一走 chatStore.sendTextMessage。
 * 草稿自持；可选 v-model 供页面预填（如标签）。页面差异逻辑用 @sent。
 */
export default defineComponent({
  name: 'AiComposer',
  components: { AiModelPicker },
  props: {
    modelValue: { type: String, default: '' },
    placeholder: {
      type: String,
      default: '今天帮你做些什么？@ 引用对话文件, / 调用技能与指令',
    },
    showMeta: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'sent'],
  setup(props, { emit }) {
    const aiChatStore = useAiChatStore()
    const sending = ref(false)
    const draft = ref(props.modelValue)

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== draft.value)
          draft.value = value
      },
    )

    watch(draft, (value) => {
      if (value !== props.modelValue)
        emit('update:modelValue', value)
    })

    const handleSend = async () => {
      const text = draft.value.trim()
      if (!text || sending.value)
        return
      sending.value = true
      logger.info({ text: '用户发起发送', data: { contentLength: text.length } })
      try {
        const chatId = await aiChatStore.sendTextMessage(text)
        draft.value = ''
        emit('update:modelValue', '')
        if (chatId)
          emit('sent', chatId)
      }
      catch (err) {
        logger.error({ text: '发送流程未预期异常', data: { error: (err as Error)?.message } })
      }
      finally {
        sending.value = false
      }
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSend()
      }
    }

    return { draft, sending, handleSend, onKeydown }
  },
})
</script>

<style lang="less" scoped>
.ai-composer {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;

  &.compact {
    max-width: none;
  }

  &__card {
    background: #FFFFFF;
    border: 1px solid #EBEEF5;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    padding: 12px 16px 10px;
  }

  &__textarea {
    width: 100%;
    min-height: 72px;
    max-height: 180px;
    border: none;
    outline: none;
    resize: none;
    font-size: 13px;
    line-height: 1.5;
    color: #2D3436;
    background: transparent;
    font-family: inherit;
    box-sizing: border-box;

    &::placeholder {
      color: #B2BEC3;
    }

    &:disabled {
      opacity: 0.7;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 4px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__send {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 16px;
      height: 16px;
      filter: brightness(0) invert(1);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }

  &__meta-btn {
    height: 28px;
    padding: 0 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.55;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
