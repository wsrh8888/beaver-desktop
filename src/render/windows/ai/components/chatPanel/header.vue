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
  <div class="ai-chat-header">
    <h2 class="ai-chat-header__title">
      {{ title }}
    </h2>
    <div class="ai-chat-header__actions">
      <button class="ai-chat-header__btn" type="button" title="详情面板" @click="aiViewStore.toggleResultPanel()">
        <img src="renderModule/assets/image/group/expand.svg" alt="panel">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

export default defineComponent({
  name: 'AiChatHeader',
  props: {
    title: { type: String, default: '海狸助手' },
  },
  setup() {
    return { aiViewStore: useAiViewStore() }
  },
})
</script>

<style lang="less" scoped>
.ai-chat-header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: #FFFFFF;

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #2D3436;
    line-height: 1.3;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    width: 32px;
    height: 32px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    background: #FFFFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: #F9FAFB;
    }
  }
}
</style>
