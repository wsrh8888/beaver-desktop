<template>
  <!-- 全局组件容器 -->
  <Teleport v-if="currentComponent" to="body">
    <!-- 根据组件类型动态渲染 -->
    <UserInfoComponent v-if="currentComponent === 'userinfo'" @close="hideComponent" />
    <!-- 这里可以添加其他组件 -->
    <!-- <SettingsComponent v-if="currentComponent === 'settings'" @close="hideComponent" /> -->
    <!-- <UpdateComponent v-if="currentComponent === 'update'" @close="hideComponent" /> -->
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useGlobalStore } from '../../pinia/view/global/index'
import UserInfoComponent from './component/userinfo/index.vue'

export default defineComponent({
  name: 'GlobalComponent',
  components: {
    UserInfoComponent,
  },
  setup() {
    const globalStore = useGlobalStore()

    const currentComponent = computed(() => globalStore.currentComponent)

    const hideComponent = () => {
      globalStore.setComponent(null)
    }

    return {
      currentComponent,
      hideComponent,
    }
  },
})
</script>

<style scoped>
/* 全局组件容器不设置任何样式，由具体组件自己控制 */
</style>
