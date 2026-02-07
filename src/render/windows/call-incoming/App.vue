<template>
  <div class="call-incoming-app">
    <IncomingNotify />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IncomingNotify from './components/IncomingNotify.vue'

export default defineComponent({
  name: 'CallIncomingApp',
  components: {
    IncomingNotify
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
