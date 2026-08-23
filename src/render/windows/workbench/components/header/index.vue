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
  <div class="workbench-header">
    <div class="workbench-header-left">
      <img
        src="renderModule/assets/image/leftBar/workbench_active.svg"
        alt="工作台"
        class="workbench-header-icon"
      >
      <span class="workbench-header-title">工作台</span>
    </div>
    <div class="workbench-header-actions">
      <button class="workbench-header-btn workbench-header-btn-refresh" type="button" @click="$emit('refresh')">
        <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="workbench-header-btn-icon">
        <span>刷新</span>
      </button>
      <button class="workbench-header-btn" type="button" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="最小化">
      </button>
      <button class="workbench-header-btn workbench-header-btn-close" type="button" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="关闭">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WorkbenchHeader',
  emits: ['refresh'],
  setup() {
    const handleMinimize = () => {
      electron.window.minimize()
    }

    const handleClose = () => {
      electron.window.closeWindow('workbench', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.workbench-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid #EBEEF5;
  background: #FFFFFF;
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.workbench-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.workbench-header-icon {
  width: 18px;
  height: 18px;
}

.workbench-header-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
}

.workbench-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.workbench-header-btn {
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: #636E72;
  font-size: 12px;

  img {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: #F9FAFB;
    color: #2D3436;
  }
}

.workbench-header-btn-refresh {
  gap: 4px;
}

.workbench-header-btn-close:hover {
  background: #FFE6E6;
}

.workbench-header-btn-icon {
  width: 14px !important;
  height: 14px !important;
}
</style>
