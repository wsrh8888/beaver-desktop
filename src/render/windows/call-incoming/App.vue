<template>
  <IncomingLayout>
    <IncomingMain />
  </IncomingLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IncomingLayout from './components/layout/index.vue'
import IncomingMain from './view/main/index.vue'

export default defineComponent({
  name: 'CallIncomingApp',
  components: {
    IncomingLayout,
    IncomingMain
  },
  setup() {
    return {}
  }
})
</script>

<style lang="less" scoped>
.call-incoming-app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}
</style>
