<template>
  <div class="settings-field">
    <AboutAttribution />
  </div>
</template>

<script lang="ts">
import type { ISettingsSection } from '../../config/settingsRegistry'
import AboutAttribution from 'renderModule/components/business/aboutAttribution/index.vue'
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
