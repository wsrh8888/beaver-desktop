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
  <AiPagePlaceholder
    title="助理"
    description="查看与管理助理相关任务，能力建设中。"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiPagePlaceholder from 'renderModule/windows/ai/components/pagePlaceholder/index.vue'

export default defineComponent({
  name: 'AiAssistantPage',
  components: { AiPagePlaceholder },
})
</script>
