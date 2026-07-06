<template>
  <div class="workbench-header">
    <div class="workbench-header-left">
      <img
        src="renderModule/assets/image/leftBar/workbench_active.svg"
        alt="工作台"
        class="workbench-header-icon"
      >
      <span class="workbench-header-title">工作台</span>
    </div>
    <div class="workbench-header-actions">
      <button class="workbench-header-btn workbench-header-btn-refresh" type="button" @click="$emit('refresh')">
        <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="workbench-header-btn-icon">
        <span>刷新</span>
      </button>
      <button class="workbench-header-btn" type="button" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="最小化">
      </button>
      <button class="workbench-header-btn workbench-header-btn-close" type="button" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="关闭">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WorkbenchHeader',
  emits: ['refresh'],
  setup() {
    const handleMinimize = () => {
      electron.window.minimize()
    }

    const handleClose = () => {
      electron.window.closeWindow('workbench', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.workbench-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid #EBEEF5;
  background: #FFFFFF;
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.workbench-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.workbench-header-icon {
  width: 18px;
  height: 18px;
}

.workbench-header-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
}

.workbench-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.workbench-header-btn {
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: #636E72;
  font-size: 12px;

  img {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: #F9FAFB;
    color: #2D3436;
  }
}

.workbench-header-btn-refresh {
  gap: 4px;
}

.workbench-header-btn-close:hover {
  background: #FFE6E6;
}

.workbench-header-btn-icon {
  width: 14px !important;
  height: 14px !important;
}
</style>
