<template>
  <div class="circle-app">
    <CircleHeader @refresh="handleRefresh" />
    <CirclePage ref="pageRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import CircleHeader from 'renderModule/windows/circle/components/header/index.vue'
import CirclePage from 'renderModule/windows/circle/page/circle/index.vue'

export default defineComponent({
  name: 'CircleApp',
  components: {
    CircleHeader,
    CirclePage,
  },
  setup() {
    const pageRef = ref<{ refresh: () => Promise<void> } | null>(null)

    const handleRefresh = () => {
      pageRef.value?.refresh()
    }

    return {
      pageRef,
      handleRefresh,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}
</style>
