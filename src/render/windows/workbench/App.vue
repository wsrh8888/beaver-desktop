<template>
  <div class="workbench-app">
    <WorkbenchHeader @refresh="handleRefresh" />
    <WorkbenchTabs />
    <div class="workbench-app-body">
      <WorkbenchViewer />
      <WorkbenchGrid v-show="workbenchStore.isHomeTab" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import WorkbenchGrid from 'renderModule/windows/workbench/components/grid/index.vue'
import WorkbenchHeader from 'renderModule/windows/workbench/components/header/index.vue'
import WorkbenchTabs from 'renderModule/windows/workbench/components/tabs/index.vue'
import WorkbenchViewer from 'renderModule/windows/workbench/components/viewer/index.vue'
import { useWorkbenchStore } from 'renderModule/windows/workbench/store/workbench/workbench'

export default defineComponent({
  name: 'WorkbenchApp',
  components: {
    WorkbenchHeader,
    WorkbenchTabs,
    WorkbenchGrid,
    WorkbenchViewer,
  },
  setup() {
    const workbenchStore = useWorkbenchStore()

    const handleRefresh = () => {
      if (workbenchStore.isHomeTab)
        workbenchStore.loadApps()
      else if (workbenchStore.activeTabId)
        window.dispatchEvent(new CustomEvent('workbench-viewer-refresh'))
    }

    onMounted(() => {
      workbenchStore.loadApps()
    })

    return {
      workbenchStore,
      handleRefresh,
    }
  },
})
</script>

<style lang="less" scoped>
.workbench-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}

.workbench-app-body {
  position: relative;
  flex: 1;
  min-height: 0;
}
</style>
