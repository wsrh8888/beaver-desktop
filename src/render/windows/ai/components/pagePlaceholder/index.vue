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
  <div class="ai-placeholder">
    <img src="renderModule/assets/image/assistant/avatar.svg" alt="beaver" class="ai-placeholder__icon">
    <h2 class="ai-placeholder__title">
      {{ title }}
    </h2>
    <p class="ai-placeholder__desc">
      {{ description }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiPagePlaceholder',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '能力建设中，后续会在此接入完整功能。' },
  },
})
</script>

<style lang="less" scoped>
.ai-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #636E72;
  background: #FFFFFF;

  &__icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.7;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    line-height: 1.3;
  }

  &__desc {
    margin: 0;
    font-size: 13px;
    color: #B2BEC3;
    line-height: 1.5;
  }
}
</style>
