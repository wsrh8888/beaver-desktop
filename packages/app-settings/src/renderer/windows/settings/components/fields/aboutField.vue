<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->

<template>
  <div class="settings-field">
    <AboutAttribution />
  </div>
</template>

<script lang="ts">
import type { ISettingsSection } from '../../config/settingsRegistry'
import AboutAttribution from '@beaver-im/beaver-biz/aboutAttribution/index.vue'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'AboutField',
  components: {
    AboutAttribution,
  },
  props: {
    section: {
      type: Object as PropType<ISettingsSection>,
      required: true,
    },
  },
})
</script>
