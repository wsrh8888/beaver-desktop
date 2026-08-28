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
  <div class="ai-welcome">
    <h1 class="ai-welcome__hero">
      海狸, 我帮你
    </h1>

    <div class="ai-welcome__modes">
      <button
        v-for="mode in modes"
        :key="mode.key"
        class="ai-welcome__mode"
        :class="{ active: aiViewStore.workMode === mode.key }"
        type="button"
        @click="aiViewStore.setWorkMode(mode.key)"
      >
        <span class="ai-welcome__mode-mark">{{ mode.mark }}</span>
        {{ mode.label }}
      </button>
    </div>

    <div class="ai-welcome__tags">
      <button
        v-for="tag in tags"
        :key="tag"
        class="ai-welcome__tag"
        type="button"
        @click="$emit('pick-tag', tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="ai-welcome__composer">
      <img
        src="renderModule/assets/image/assistant/avatar.svg"
        alt="beaver"
        class="ai-welcome__mascot"
      >
      <AiComposer
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        @send="$emit('send')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiComposer from 'renderModule/windows/ai/components/composer/index.vue'
import { useAiViewStore, type AiWorkMode } from 'renderModule/windows/ai/pinia/view'

export default defineComponent({
  name: 'AiWelcome',
  components: { AiComposer },
  props: {
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'send', 'pick-tag'],
  setup() {
    const aiViewStore = useAiViewStore()
    const modes: Array<{ key: AiWorkMode, label: string, mark: string }> = [
      { key: 'office', label: '日常办公', mark: '办' },
      { key: 'code', label: '代码开发', mark: '</>' },
      { key: 'design', label: '设计创意', mark: '设' },
    ]
    const tags = ['文档处理', '群聊总结', '数据分析', '个人工作台', '幻灯片']
    return { aiViewStore, modes, tags }
  },
})
</script>

<style lang="less" scoped>
.ai-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  box-sizing: border-box;
  background: #F9FAFB;

  &__hero {
    margin: 0 0 24px;
    font-size: 22px;
    font-weight: 600;
    color: #2D3436;
    line-height: 1.3;
  }

  &__modes {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__mode {
    height: 36px;
    padding: 0 16px;
    border: 1px solid #EBEEF5;
    border-radius: 18px;
    background: #FFFFFF;
    color: #636E72;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 200ms cubic-bezier(0.33, 1, 0.68, 1);

    &:hover {
      border-color: #FF7D45;
      color: #FF7D45;
    }

    &.active {
      background: #2D3436;
      border-color: #2D3436;
      color: #FFFFFF;
    }
  }

  &__mode-mark {
    font-size: 11px;
    font-weight: 600;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;
    max-width: 720px;
  }

  &__tag {
    height: 32px;
    padding: 0 12px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    background: #FFFFFF;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      border-color: #FF7D45;
      color: #FF7D45;
      background: #FFE6D9;
    }
  }

  &__composer {
    position: relative;
    width: 100%;
    max-width: 720px;
  }

  &__mascot {
    position: absolute;
    right: 16px;
    top: -28px;
    width: 40px;
    height: 40px;
    z-index: 1;
  }
}
</style>
