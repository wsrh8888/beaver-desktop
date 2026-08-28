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
  <header class="ai-header">
    <div class="ai-header__left">
      <button
        v-if="aiViewStore.sidebarCollapsed"
        class="ai-header__expand"
        type="button"
        title="展开侧栏"
        @click="aiViewStore.toggleSidebar()"
      >
        <img src="renderModule/assets/image/group/expand.svg" alt="expand">
      </button>
    </div>
    <div class="ai-header__drag" />
    <div class="ai-header__controls">
      <div class="ai-header__btn" @click="minimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="minimize">
      </div>
      <div class="ai-header__btn" @click="maximize">
        <img src="renderModule/assets/image/header/maximize.svg" alt="maximize">
      </div>
      <div class="ai-header__btn ai-header__btn--close" @click="close">
        <img src="renderModule/assets/image/header/close.svg" alt="close">
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

export default defineComponent({
  name: 'AiHeader',
  setup() {
    const aiViewStore = useAiViewStore()
    const minimize = () => window.electron.window.minimize()
    const maximize = () => window.electron.window.maximize()
    const close = () => window.electron.window.closeWindow('ai', { hideOnly: true })
    return { aiViewStore, minimize, maximize, close }
  },
})
</script>

<style lang="less" scoped>
.ai-header {
  height: 40px;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  -webkit-app-region: drag;
  flex-shrink: 0;

  &__left {
    display: flex;
    align-items: center;
    padding-left: 8px;
    -webkit-app-region: no-drag;
  }

  &__expand {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  &__drag {
    flex: 1;
  }

  &__controls {
    display: flex;
    -webkit-app-region: no-drag;
  }

  &__btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &--close:hover {
      background: #FF5252;
    }
  }
}
</style>
