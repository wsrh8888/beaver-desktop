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
  <BeaverDialog
    :model-value="true"
    title="AI 设置"
    width="880px"
    @update:model-value="onDialogVisible"
    @close="handleClose"
  >
    <div class="ai-model-settings">
      <AiSettingsComponentLeft v-model="activeSection" />
      <AiSettingsComponentRight :section="activeSection" />
    </div>
  </BeaverDialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import AiSettingsComponentLeft from './components/componentLeft/index.vue'
import AiSettingsComponentRight from './components/componentRight/index.vue'
import { useAiGlobalStore } from 'renderModule/windows/ai/pinia/global'
import type { AiSettingsSection } from 'renderModule/windows/ai/types/model'

/**
 * AI 设置壳：左侧导航 + 右侧面板（按 section 切换）。
 * 由 page/global 的 v-if 挂载。
 */
export default defineComponent({
  name: 'AiModelSettings',
  components: { BeaverDialog, AiSettingsComponentLeft, AiSettingsComponentRight },
  setup() {
    const aiGlobalStore = useAiGlobalStore()
    const activeSection = ref<AiSettingsSection>('model')

    const handleClose = () => {
      aiGlobalStore.setVisible('settings', false)
    }

    const onDialogVisible = (visible: boolean) => {
      if (!visible)
        handleClose()
    }

    return {
      activeSection,
      handleClose,
      onDialogVisible,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-model-settings {
  display: flex;
  gap: 24px;
  min-height: 420px;
}
</style>
