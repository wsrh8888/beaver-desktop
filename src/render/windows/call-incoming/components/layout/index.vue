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
  <div class="incoming-layout">
    <div class="close-btn" @click="handleClose">
      <img src="renderModule/assets/image/header/close.svg" alt="close">
    </div>
    <div class="content-body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IncomingLayout',
  setup() {
    const handleClose = () => {
      (window as any).electron?.window.closeWindow()
    }
    return { handleClose }
  }
})
</script>

<style lang="less" scoped>
.incoming-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    border-radius: 4px;
    transition: background 0.2s;

    img {
      width: 12px;
      height: 12px;
      opacity: 0.5;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);

      img {
        opacity: 0.8;
      }
    }
  }

  .content-body {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>
