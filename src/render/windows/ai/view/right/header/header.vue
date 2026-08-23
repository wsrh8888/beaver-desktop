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
  <div class="ai-right-header">
    <div class="ai-right-header__info">
      <h2>{{ title }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiRightHeader',
  props: {
    title: {
      type: String,
      default: 'AI助手',
    },
  },
})
</script>

<style lang="less" scoped>
.ai-right-header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .ai-right-header__info h2 {
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    margin: 0;
    line-height: 1.3;
  }
}
</style>
