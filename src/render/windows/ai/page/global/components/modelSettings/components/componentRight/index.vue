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
  <section class="ai-settings-component-right">
    <AiSettingsModel v-if="section === 'model'" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { AiSettingsSection } from 'renderModule/windows/ai/types/model'
import AiSettingsModel from './model/index.vue'

/**
 * 设置右侧容器：按左侧 section 挂载对应独立页面。
 */
export default defineComponent({
  name: 'AiSettingsComponentRight',
  components: { AiSettingsModel },
  props: {
    section: {
      type: String as PropType<AiSettingsSection>,
      required: true,
    },
  },
})
</script>

<style lang="less" scoped>
.ai-settings-component-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
}
</style>
