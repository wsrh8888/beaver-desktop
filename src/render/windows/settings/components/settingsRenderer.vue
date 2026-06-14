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

const fieldComponentMap: Record<SettingsFieldType, Component> = {
  devices: DeviceListField,
  'toggle-group': ToggleField,
  keyboard: KeyboardField,
  about: AboutField,
}

export default defineComponent({
  name: 'SettingsRenderer',
  components: {
    DeviceListField,
    ToggleField,
    KeyboardField,
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
