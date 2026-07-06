<template>
  <div class="circle-app">
    <CircleHeader @refresh="handleRefresh" />
    <div class="circle-app-body">
      <CircleSidebar />
      <CircleFeed />
    </div>
    <CircleCreateModal v-if="circleStore.showCreateCircle" />
    <CirclePostModal v-if="circleStore.showCreatePost" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import CircleCreateModal from 'renderModule/windows/circle/components/createCircle/index.vue'
import CircleFeed from 'renderModule/windows/circle/components/feed/index.vue'
import CircleHeader from 'renderModule/windows/circle/components/header/index.vue'
import CirclePostModal from 'renderModule/windows/circle/components/createPost/index.vue'
import CircleSidebar from 'renderModule/windows/circle/components/sidebar/index.vue'
import { useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleApp',
  components: {
    CircleHeader,
    CircleSidebar,
    CircleFeed,
    CircleCreateModal,
    CirclePostModal,
  },
  setup() {
    const circleStore = useCircleStore()

    const handleRefresh = () => {
      circleStore.refreshAll()
    }

    onMounted(() => {
      circleStore.loadMyCircles()
    })

    return {
      circleStore,
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

.circle-app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
