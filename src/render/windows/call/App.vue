<template>
  <div class="call-app">
    <!-- 通用页头：包含最小化/标题等 -->
    <CallHeader />

    <!-- 核心视图区域：直接挂载 CallView -->
    <CallView />

    <!-- 底部操作栏 -->
    <CallFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CallHeader from './components/CallHeader.vue'
import CallView from './components/CallView.vue'
import CallFooter from './components/CallFooter.vue'
import { usecallStore } from './pinia/call'


export default defineComponent({
  name: 'CallApp',
  components: {
    CallHeader,
    CallView,
    CallFooter
  },
  setup() {
    const callStore = usecallStore()



    return {
      callStore
    }
  }
})
</script>

<style lang="less">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
  background: #1e2022;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.call-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at center, #2c3e50 0%, #000000 100%);
}
</style>
