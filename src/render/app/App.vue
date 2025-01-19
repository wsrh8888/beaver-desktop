<template>
  <div class="app__container">
    <header class="app__header app__drag">
      
    </header>
    <Sidebar class="app__sidebar app__drag"></Sidebar>

    <div class="app__content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted} from 'vue'
// import Sidebar from './components/sidebar/index.vue'
import Sidebar from 'renderModule/app/components/sidebar/index.vue'
import { useInitStore } from 'renderModule/app/pinia/init/init'

export default defineComponent({
  components: {
    Sidebar
  },
  setup() {
    const initStore = useInitStore();

    onMounted(async () => {
      await initStore.initApp()
      // console.log(1111, import.meta.env)
      // console.log(1111, import.meta.env.VITE_API_BASE)

    })
    return {}
  }
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
  .app__header {
    height: 30px;
    color: #fff;
    display: flex;
    align-items: center;
    padding: 0 20px;
    margin-left: 66px;
    border-bottom: 1px solid #e8e8e8;
    
  }
  .app__content {
    flex: 1;
    margin-left: 66px;
    overflow: hidden;
  }
}
</style>
