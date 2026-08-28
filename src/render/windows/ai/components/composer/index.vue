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
        :value="modelValue"
        class="ai-composer__textarea"
        :placeholder="placeholder"
        rows="3"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @keydown="onKeydown"
      />
      <div class="ai-composer__toolbar">
        <button class="ai-composer__icon-btn" type="button" title="添加附件">
          <img src="renderModule/assets/image/common/add.svg" alt="add">
        </button>
        <div class="ai-composer__right">
          <button class="ai-composer__model" type="button">
            <img src="renderModule/assets/image/ai/robot.svg" alt="model">
            Auto
          </button>
          <button class="ai-composer__icon-btn" type="button" title="语音">
            <img src="renderModule/assets/image/assistant/mic.svg" alt="mic">
          </button>
          <button
            class="ai-composer__send"
            type="button"
            :disabled="!modelValue.trim()"
            @click="$emit('send')"
          >
            <img src="renderModule/assets/image/assistant/send.svg" alt="发送">
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMeta" class="ai-composer__meta">
      <AiSpacePicker />
      <button class="ai-composer__meta-btn" type="button">
        <img src="renderModule/assets/image/common/help.svg" alt="permission">
        默认权限
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiSpacePicker from 'renderModule/windows/ai/components/spacePicker/index.vue'

export default defineComponent({
  name: 'AiComposer',
  components: { AiSpacePicker },
  props: {
    modelValue: { type: String, default: '' },
    placeholder: {
      type: String,
      default: '今天帮你做些什么？@ 引用对话文件, / 调用技能与指令',
    },
    showMeta: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'send'],
  setup(_props, { emit }) {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        emit('send')
      }
    }

    return { onKeydown }
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
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__icon-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 16px;
      height: 16px;
      opacity: 0.55;
    }

    &:hover {
      background: #F9FAFB;
    }
  }

  &__model {
    height: 32px;
    padding: 0 12px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    background: #FFFFFF;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    img {
      width: 14px;
      height: 14px;
    }
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
