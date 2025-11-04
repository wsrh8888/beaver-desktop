<template>
  <div class="app__container">
    <HeaderComponent />
    <Sidebar class="app__sidebar app__drag" />

    <div class="app__content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import HeaderComponent from 'renderModule/app/components/header/header.vue'
// import Sidebar from './components/sidebar/index.vue'
import Sidebar from 'renderModule/app/components/sidebar/index.vue'
import NotificationManager from 'renderModule/app/notification-manager'
import { useAppStore } from 'renderModule/app/pinia/app/app'
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  components: {
    Sidebar,
    HeaderComponent,
  },
  setup() {
    const appStore = useAppStore()

    onMounted(() => {
      // 初始化通知管理器（监听数据变化）
      NotificationManager.init()

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
