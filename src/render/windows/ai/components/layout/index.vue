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
  <div class="ai-layout">
    <header class="ai-layout__titlebar">
      <div class="ai-layout__titlebar-drag" />
      <div class="ai-layout__window-controls">
        <div class="ai-layout__control-btn minimize" @click="handleMinimize">
          <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
        </div>
        <div class="ai-layout__control-btn maximize" @click="handleMaximize">
          <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
        </div>
        <div class="ai-layout__control-btn close" @click="handleClose">
          <img src="renderModule/assets/image/header/close.svg" alt="close">
        </div>
      </div>
    </header>

    <slot name="mode" />

    <div class="ai-layout__body">
      <div v-if="showLeft" class="ai-layout__left">
        <slot name="left" />
      </div>

      <main class="ai-layout__main">
        <slot name="main" />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiLayout',
  props: {
    showLeft: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const handleMinimize = () => {
      window.electron.window.minimize()
    }

    const handleMaximize = () => {
      window.electron.window.maximize()
    }

    const handleClose = () => {
      window.electron.window.closeWindow('ai', { hideOnly: true })
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
.ai-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;

  .ai-layout__titlebar {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFFFFF;
    border-bottom: 1px solid #EBEEF5;
    -webkit-app-region: drag;
    flex-shrink: 0;

    .ai-layout__titlebar-drag {
      flex: 1;
    }

    .ai-layout__window-controls {
      display: flex;
      -webkit-app-region: no-drag;
    }

    .ai-layout__control-btn {
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
        background: rgba(0, 0, 0, 0.05);
      }

      &.close:hover {
        background: #FF5252;
        color: #FFFFFF;
      }
    }
  }

  .ai-layout__body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .ai-layout__left {
    width: 280px;
    flex-shrink: 0;
    background: #FFFFFF;
    border-right: 1px solid #EBEEF5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ai-layout__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    overflow: hidden;
  }
}
</style>
