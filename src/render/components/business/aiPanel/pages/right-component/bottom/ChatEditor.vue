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

<!--
  输入区：自增高文本域 + 发送按钮（对标 IM 的 ChatEditor/Editor.vue）。
  发送是「本地先落两条消息（用户 + 助手占位）→ 请求服务端 → 回执回填话题」，
  之后的内容由 ws 增量拼进占位气泡（notification-manager/stream.ts）。
  请求失败就地收尾，不留一个永远转圈的气泡。
-->
<template>
  <footer class="ai-editor">
    <div class="input-wrap" :class="{ 'is-focused': focused }">
      <textarea
        ref="inputRef"
        v-model="draft"
        class="input"
        rows="1"
        :placeholder="placeholder"
        :disabled="streaming"
        @keydown="onKeydown"
        @focus="focused = true"
        @blur="focused = false"
        @input="autoResize"
      />
      <button
        class="send"
        type="button"
        :class="{ 'is-ready': canSend }"
        :disabled="!canSend"
        title="发送"
        @click="submit"
      >
        <img src="renderModule/assets/image/moment/send.svg" alt="发送">
      </button>
    </div>
  </footer>
</template>

<script lang="ts">
import { sendAgentMessageApi } from 'renderModule/api/agent'
import Logger from 'renderModule/utils/logger'
import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import { useAiPanelStore } from '../../../store'

const logger = new Logger('AiPanelEditor')

export default defineComponent({
  name: 'AiPanelChatEditor',
  props: {
    /** 场景内绑定 ID：发给哪个上下文 */
    refId: {
      type: String,
      default: '',
    },
    /** 场景标识，服务端据此归类对话 */
    module: {
      type: String,
      default: 'chat',
    },
    placeholder: {
      type: String,
      default: '问点什么…',
    },
    /** 面板展开时自动聚焦，省一次点击 */
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const aiStore = useAiPanelStore()
    const draft = ref('')
    const focused = ref(false)
    const inputRef = ref<HTMLTextAreaElement | null>(null)

    /** 生成中：禁止输入与发送，避免两路请求打架 */
    const streaming = computed(() => aiStore.isStreaming(props.refId))
    const canSend = computed(() => !!draft.value.trim() && !streaming.value)

    const autoResize = () => {
      const el = inputRef.value
      if (!el)
        return
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }

    const reset = () => {
      draft.value = ''
      nextTick(autoResize)
    }

    const focus = () => {
      nextTick(() => inputRef.value?.focus())
    }

    const submit = async () => {
      const text = draft.value.trim()
      if (!text || streaming.value || !props.refId)
        return
      const refId = props.refId
      reset()

      // 先落本地：用户气泡 + 助手占位，用户立刻看到「在想了」
      aiStore.addUserMessage(refId, text)
      aiStore.beginAssistantMessage(refId)

      try {
        const res = await sendAgentMessageApi({
          parts: [{ type: 'text', text }],
          module: props.module,
          refId,
          topicId: aiStore.activeTopicIdOf(refId) || undefined,
          clientMsgId: `cmsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          interactMode: 'ask',
        })
        if (res.code !== 0 || !res.result)
          throw new Error((res as any).msg || (res as any).message || '发送失败')
        // 新话题由服务端建：把 topicId 回填，后续消息才知道发往哪
        aiStore.applySendReceipt(refId, res.result.topicId || '', text.slice(0, 40))
      }
      catch (err) {
        logger.error({ text: 'AI 发送失败', data: { refId, error: (err as Error).message } })
        aiStore.endAssistantStream(refId, '发送失败')
      }
    }

    const onKeydown = (e: KeyboardEvent) => {
      // 输入法组词中的 Enter 属于选词，不能当发送
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault()
        void submit()
      }
    }

    // 被禁用（如生成中）时收起残留的输入法候选
    watch(streaming, (v) => {
      if (v)
        inputRef.value?.blur()
    })

    watch(() => props.visible, (v) => {
      if (v)
        focus()
    })

    return { draft, focused, inputRef, streaming, canSend, autoResize, submit, onKeydown, reset, focus }
  },
})
</script>

<style lang="less" scoped>
.ai-editor {
  flex-shrink: 0;
  padding: 12px 16px 14px;
  border-top: 1px solid #ECEEF0;
  background: #fff;

  .input-wrap {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px 8px 8px 12px;
    border: 1px solid #ECEEF0;
    border-radius: 12px;
    background: #FAFBFC;
    transition: border-color 0.15s, background 0.15s;

    &.is-focused {
      border-color: #FF7D45;
      background: #fff;
    }

    .input {
      flex: 1;
      min-width: 0;
      min-height: 22px;
      max-height: 120px;
      padding: 0;
      border: none;
      outline: none;
      resize: none;
      background: transparent;
      color: #2D3436;
      font-family: inherit;
      font-size: 13px;
      line-height: 22px;

      &::placeholder {
        color: #B2BEC3;
      }
    }

    .send {
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
        background: #FF7D45;
        cursor: pointer;

        img {
          filter: none;
        }

        &:hover {
          background: #F06A32;
        }
      }
    }
  }
}
</style>
