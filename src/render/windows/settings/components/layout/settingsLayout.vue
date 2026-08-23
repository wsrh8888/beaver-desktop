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
  <div class="settings-layout">
    <aside class="settings-nav">
      <div
        v-for="section in registry"
        :key="section.id"
        class="settings-nav__item"
        :class="{ active: activeSectionId === section.id }"
        @click="handleSelect(section.id)"
      >
        {{ section.label }}
      </div>
    </aside>
    <main class="settings-content">
      <SettingsRenderer v-if="activeSection" :section="activeSection" />
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { settingsRegistry } from '../../config/settingsRegistry'
import { useSettingsUiStore } from '../../pinia/settingsUi'
import SettingsRenderer from '../settingsRenderer.vue'

export default defineComponent({
  name: 'SettingsLayout',
  components: {
    SettingsRenderer,
  },
  setup() {
    const settingsUiStore = useSettingsUiStore()
    const registry = settingsRegistry
    const activeSectionId = computed(() => settingsUiStore.activeSectionId)
    const activeSection = computed(() => settingsUiStore.activeSection)

    const handleSelect = (sectionId: string) => {
      settingsUiStore.setActiveSection(sectionId)
    }

    return {
      registry,
      activeSectionId,
      activeSection,
      handleSelect,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.settings-nav {
  width: 168px;
  flex-shrink: 0;
  background: #F9FAFB;
  border-right: 1px solid #EBEEF5;
  overflow-y: auto;
  padding: 8px 0;

  &__item {
    padding: 12px 20px;
    font-size: 14px;
    color: #636E72;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      color: #2D3436;
    }

    &.active {
      background: rgba(255, 125, 69, 0.08);
      color: #FF7D45;
      border-left-color: #FF7D45;
      font-weight: 500;
    }
  }
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #FFFFFF;
}
</style>
