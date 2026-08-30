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
  <aside class="ai-settings-component-left">
    <button
      v-for="item in sections"
      :key="item.key"
      class="ai-settings-component-left__item"
      :class="{ active: modelValue === item.key }"
      type="button"
      @click="$emit('update:modelValue', item.key)"
    >
      <span class="ai-settings-component-left__mark">{{ item.mark }}</span>
      <span>{{ item.label }}</span>
    </button>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { AiSettingsSection } from 'renderModule/windows/ai/types/model'
import type { PropType } from 'vue'

/** 设置左侧导航 */
export default defineComponent({
  name: 'AiSettingsComponentLeft',
  props: {
    modelValue: {
      type: String as PropType<AiSettingsSection>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup() {
    const sections: Array<{ key: AiSettingsSection, label: string, mark: string }> = [
      { key: 'model', label: '模型', mark: 'M' },
    ]
    return { sections }
  },
})
</script>

<style lang="less" scoped>
.ai-settings-component-left {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  border-right: 1px solid #EBEEF5;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #636E72;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: background 150ms ease;

    &:hover {
      background: #F9FAFB;
    }

    &.active {
      background: rgba(255, 125, 69, 0.1);
      color: #FF7D45;
      font-weight: 500;
    }
  }

  &__mark {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    border-radius: 4px;
    background: #EBEEF5;
    color: #636E72;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  &__hint {
    margin-top: 12px;
    padding: 8px 12px;
    font-size: 11px;
    line-height: 1.5;
    color: #B2BEC3;
  }
}
</style>
