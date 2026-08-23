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
  <div class="window-controls app__drag">
    <div class="control-buttons app__no_drag">
      <div class="control-button close" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="close">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WindowControls',
  setup() {
    const handleClose = () => {
      window.electron.window.closeWindow('login', { hideOnly: false })
    }

    return {
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.window-controls {
  width: 100%;
  height: var(--height-header);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 var(--spacing-2);
  z-index: 1000;
  -webkit-app-region: drag;
  position: absolute;

  .control-buttons {
    display: flex;
    justify-content: center;
    -webkit-app-region: no-drag;

  }

  .control-button {
    width: var(--size-icon-lg);
    height: var(--size-icon-lg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    background: transparent;

    img {
      width: var(--size-icon-sm);
      height: var(--size-icon-sm);
      opacity: 0.7;
      transition: opacity var(--transition-fast);
    }

    &:hover img {
      opacity: 1;
    }
    &:hover {
      background: rgba(0,0,0,0.05);
    }
  }
}
</style>
