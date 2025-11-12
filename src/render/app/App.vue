<template>
  <div class="app__container">
    <!-- <HeaderComponent />
    <Sidebar class="app__sidebar app__drag" />

    <div class="app__content">
      <router-view />
    </div>
    <GlobalComponent /> -->
  </div>
</template>

<script lang="ts">
import GlobalComponent from 'renderModule/app/components/global/index.vue'
import HeaderComponent from 'renderModule/app/components/layout/header/header.vue'
import Sidebar from 'renderModule/app/components/layout/sidebar/index.vue'
import { useAppStore } from 'renderModule/app/pinia/app/app'
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  components: {
    Sidebar,
    HeaderComponent,
    GlobalComponent,
  },
  setup() {
    const appStore = useAppStore()

    onMounted(() => {
      // 初始化应用数据（异步，不阻塞UI渲染）
      appStore.initApp()
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
.app__container {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .app__sidebar {
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
  }

  .app__content {
    flex: 1;
    margin-left: 66px;
    overflow: hidden;
  }
}
</style>
