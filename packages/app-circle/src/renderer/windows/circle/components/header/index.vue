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
  <div class="circle-header">
    <div class="circle-header-drag">
      <img src="renderModule/assets/image/leftBar/circle_active.svg" alt="圈子" class="circle-header-icon">
      <span class="circle-header-title">圈子</span>
    </div>
    <div class="circle-header-actions">
      <button class="circle-header-btn" type="button" @click="$emit('refresh')">
        <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="circle-header-btn-icon">
      </button>
      <button class="circle-header-btn" type="button" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="最小化">
      </button>
      <button class="circle-header-btn circle-header-btn-close" type="button" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="关闭">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CircleHeader',
  emits: ['refresh'],
  setup() {
    const handleMinimize = () => {
      electron.window.minimize()
    }

    const handleClose = () => {
      electron.window.closeWindow('circle', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-header {
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

.circle-header-drag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.circle-header-icon {
  width: 18px;
  height: 18px;
}

.circle-header-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
}

.circle-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.circle-header-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: #F9FAFB;
  }
}

.circle-header-btn-close:hover {
  background: #FFE6E6;
}

.circle-header-btn-icon {
  width: 16px !important;
  height: 16px !important;
}
</style>
