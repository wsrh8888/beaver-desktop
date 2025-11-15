<template>
  <!-- 全局组件容器 -->
  <Teleport v-if="currentComponent" to="body">
    <ProfileComponent v-if="currentComponent === 'profile'" @close="hideComponent" />
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useGlobalStore } from '../../pinia/view/global/index'
import ProfileComponent from './component/profile/index.vue'

export default defineComponent({
  name: 'GlobalComponent',
  components: {
    ProfileComponent,
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
