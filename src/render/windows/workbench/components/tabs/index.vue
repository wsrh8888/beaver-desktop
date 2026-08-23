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
  <div class="workbench-tabs">
    <div
      v-for="tab in workbenchStore.tabs"
      :key="tab.id"
      class="workbench-tab"
      :class="{ 'workbench-tab-active': tab.id === workbenchStore.activeTabId }"
      @click="workbenchStore.switchTab(tab.id)"
    >
      <span class="workbench-tab-title">{{ tab.title }}</span>
      <button
        v-if="tab.type === 'app'"
        class="workbench-tab-close"
        type="button"
        @click.stop="workbenchStore.closeTab(tab.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useWorkbenchStore } from 'renderModule/windows/workbench/store/workbench/workbench'

export default defineComponent({
  name: 'WorkbenchTabs',
  setup() {
    const workbenchStore = useWorkbenchStore()
    return { workbenchStore }
  },
})
</script>

<style lang="less" scoped>
.workbench-tabs {
  display: flex;
  align-items: stretch;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #EBEEF5;
  background: #FFFFFF;
  flex-shrink: 0;
  overflow-x: auto;
  gap: 4px;
}

.workbench-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 160px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: #636E72;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-app-region: no-drag;

  &:hover {
    color: #2D3436;
    background: #F9FAFB;
  }
}

.workbench-tab-active {
  color: #FF7D45;
  font-weight: 500;

  &::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    height: 2px;
    background: #FF7D45;
    border-radius: 2px 2px 0 0;
  }
}

.workbench-tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workbench-tab-close {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #636E72;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #EBEEF5;
    color: #2D3436;
  }
}
</style>
