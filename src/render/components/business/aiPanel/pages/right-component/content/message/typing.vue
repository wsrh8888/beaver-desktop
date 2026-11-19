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

<!-- 流式生成中的打字点，三个点错峰跳动 -->
<template>
  <span class="typing" aria-label="生成中">
    <i /><i /><i />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AiMessageTyping',
})
</script>

<style lang="less" scoped>
.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 16px;
  margin-left: 2px;

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #FF7D45;
    animation: ai-bounce 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

@keyframes ai-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}
</style>
