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
  <aside class="ai-result-panel">
    <div class="ai-result-panel__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="ai-result-panel__tab"
        :class="{ active: aiViewStore.resultTab === tab.key }"
        type="button"
        @click="aiViewStore.setResultTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="ai-result-panel__body">
      <div class="ai-result-panel__empty">
        <img src="renderModule/assets/image/moment/file.svg" alt="empty">
        <h3>{{ currentLabel }}</h3>
        <p>任务产出后会在此展示可验收结果</p>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useAiViewStore, type AiResultTab } from 'renderModule/windows/ai/pinia/view'

export default defineComponent({
  name: 'AiResultPanel',
  setup() {
    const aiViewStore = useAiViewStore()
    const tabs: Array<{ key: AiResultTab, label: string }> = [
      { key: 'artifact', label: '产物' },
      { key: 'files', label: '全部文件' },
      { key: 'changes', label: '变更' },
      { key: 'preview', label: '预览' },
    ]
    const currentLabel = computed(
      () => tabs.find(item => item.key === aiViewStore.resultTab)?.label || '产物',
    )
    return { aiViewStore, tabs, currentLabel }
  },
})
</script>

<style lang="less" scoped>
.ai-result-panel {
  width: 360px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-left: 1px solid #EBEEF5;

  &__tabs {
    height: 40px;
    display: flex;
    padding: 0 16px;
    border-bottom: 1px solid #EBEEF5;
    flex-shrink: 0;
  }

  &__tab {
    position: relative;
    height: 40px;
    padding: 0 12px;
    border: none;
    background: transparent;
    color: #636E72;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;

    &.active {
      color: #2D3436;

      &::after {
        content: '';
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 0;
        height: 2px;
        background: #FF7D45;
      }
    }
  }

  &__body {
    flex: 1;
    overflow: auto;
    padding: 24px;
  }

  &__empty {
    height: 100%;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    img {
      width: 32px;
      height: 32px;
      opacity: 0.45;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 500;
      color: #2D3436;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #B2BEC3;
    }
  }
}
</style>
