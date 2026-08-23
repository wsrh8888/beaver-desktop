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
  <div class="settings-header">
    <div class="settings-header__title">
      设置
    </div>
    <div class="settings-header__controls">
      <button class="settings-header__btn" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="最小化">
      </button>
      <button class="settings-header__btn settings-header__btn--close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="关闭">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsHeader',
  setup() {
    const handleMinimize = () => {
      electron.window.minimize()
    }

    const handleClose = () => {
      electron.window.closeWindow('settings', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-header {
  height: 40px;
  background: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  -webkit-app-region: drag;

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
    -webkit-app-region: no-drag;
  }

  &__btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    img {
      width: 12px;
      height: 12px;
      opacity: 0.7;
    }

    &:hover {
      background: #F9FAFB;
    }

    &--close:hover {
      background: #FFE6E6;
    }
  }
}
</style>
