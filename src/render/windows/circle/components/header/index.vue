<template>
  <div class="circle-header">
    <div class="circle-header-drag">
      <img src="renderModule/assets/image/leftBar/circle_active.svg" alt="圈子" class="circle-header-icon">
      <span class="circle-header-title">圈子</span>
    </div>
    <div class="circle-header-actions">
      <button class="circle-header-btn" type="button" @click="$emit('refresh')">
        <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="circle-header-btn-icon">
      </button>
      <button class="circle-header-btn" type="button" @click="handleMinimize">
        <img src="renderModule/assets/image/header/minimize.svg" alt="最小化">
      </button>
      <button class="circle-header-btn circle-header-btn-close" type="button" @click="handleClose">
        <img src="renderModule/assets/image/header/close.svg" alt="关闭">
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CircleHeader',
  emits: ['refresh'],
  setup() {
    const handleMinimize = () => {
      electron.window.minimize()
    }

    const handleClose = () => {
      electron.window.closeWindow('circle', { hideOnly: true })
    }

    return {
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-header {
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

.circle-header-drag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.circle-header-icon {
  width: 18px;
  height: 18px;
}

.circle-header-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
}

.circle-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.circle-header-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: #F9FAFB;
  }
}

.circle-header-btn-close:hover {
  background: #FFE6E6;
}

.circle-header-btn-icon {
  width: 16px !important;
  height: 16px !important;
}
</style>
