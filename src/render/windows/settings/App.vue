<template>
  <div class="settings-app">
    <SettingsHeader />
    <SettingsLayout />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import SettingsHeader from './components/layout/header.vue'
import SettingsLayout from './components/layout/settingsLayout.vue'
import { useSettingsStore } from './pinia/settings'

export default defineComponent({
  name: 'SettingsApp',
  components: {
    SettingsHeader,
    SettingsLayout,
  },
  setup() {
    const settingsStore = useSettingsStore()

    onMounted(() => {
      settingsStore.init()
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
.settings-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}
</style>
