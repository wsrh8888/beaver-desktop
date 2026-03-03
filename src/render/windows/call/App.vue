<template>
  <div class="call-app">
    <CallLayout>
      <template #content>
        <CallViewStage />
      </template>

      <template #footer>
        <CallViewFooter />
      </template>
    </CallLayout>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CallLayout from './components/layout/index.vue'
import CallViewStage from './view/stage/index.vue'
import CallViewFooter from './view/footer/index.vue'
import { usecallStore } from './pinia/call'

export default defineComponent({
  name: 'CallApp',
  components: {
    CallLayout,
    CallViewStage,
    CallViewFooter
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
  background: #f5f7fa;
  color: #333;
  font-family: "SF Pro", Roboto, "PingFang SC", "微软雅黑", sans-serif;
}

.call-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
