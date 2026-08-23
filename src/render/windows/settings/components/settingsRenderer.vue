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
  <component :is="fieldComponent" v-if="fieldComponent" :section="section" />
</template>

<script lang="ts">
import type { Component } from 'vue'
import type { ISettingsSection, SettingsFieldType } from '../../config/settingsRegistry'
import { defineComponent, computed, type PropType } from 'vue'
import AboutField from './fields/aboutField.vue'
import DeviceListField from './fields/deviceListField.vue'
import KeyboardField from './fields/keyboardField.vue'
import ToggleField from './fields/toggleField.vue'
import UpgradeField from './fields/upgradeField.vue'

const fieldComponentMap: Record<SettingsFieldType, Component> = {
  devices: DeviceListField,
  'toggle-group': ToggleField,
  keyboard: KeyboardField,
  upgrade: UpgradeField,
  about: AboutField,
}

export default defineComponent({
  name: 'SettingsRenderer',
  components: {
    DeviceListField,
    ToggleField,
    KeyboardField,
    UpgradeField,
    AboutField,
  },
  props: {
    section: {
      type: Object as PropType<ISettingsSection>,
      required: true,
    },
  },
  setup(props) {
    const fieldComponent = computed(() => {
      return fieldComponentMap[props.section.type] || null
    })

    return {
      fieldComponent,
    }
  },
})
</script>
