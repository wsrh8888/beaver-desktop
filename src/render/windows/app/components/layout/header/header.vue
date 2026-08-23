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
  <header class="title-bar">
    <div class="title-bar-left" />

    <div class="window-controls">
      <div class="window-control-button minimize" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
      </div>
      <div class="window-control-button maximize" @click="handleMaximize">
        <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
      </div>
      <div class="window-control-button close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="close">
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const handleMinimize = () => {
      window.electron.window.minimize()
    }

    const handleMaximize = () => {
      window.electron.window.maximize()
    }

    const handleClose = () => {
      window.electron.window.closeWindow('app', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleMaximize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.title-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // padding: 0 16px;
  background: #FFFFFF;
  -webkit-app-region: drag;
  border-bottom: 1px solid #EBEEF5;

  .title-bar-left {
    display: flex;
    align-items: center;
  }

  .app-title {
    font-size: 13px;
    font-weight: 500;
    color: #2D3436;
  }

  .window-controls {
    display: flex;
    -webkit-app-region: no-drag;
  }

  .window-control-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #636E72;

    img {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(0,0,0,0.05);
    }

    &.close:hover {
      background: #FF5252;
      color: white;
    }
  }
}
</style>
