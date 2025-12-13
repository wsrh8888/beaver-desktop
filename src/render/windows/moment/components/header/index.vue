<template>
  <div class="moment-header">
    <div class="header-content">
      <!-- 刷新按钮 -->
      <button class="header-btn refresh-btn" @click="handleRefresh">
        <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="header-icon" :class="{ refreshing: isRefreshing }">
      </button>

      <!-- 窗口控制按钮 -->
      <div class="window-controls">
        <button class="header-btn minimize-btn" @click="handleMinimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button class="header-btn close-btn" @click="handleClose">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MomentHeader',
  setup() {
    const isRefreshing = ref(false)

    const handleRefresh = () => {
      // 触发全局刷新事件
      window.dispatchEvent(new CustomEvent('moment-refresh'))
    }

    const handleMinimize = () => {
      electron?.window.minimize()
    }

    const handleClose = () => {
      electron?.window.closeWindow('moment', { hideOnly: true })
    }

    return {
      isRefreshing,
      handleRefresh,
      handleMinimize,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.moment-header {
  height: 40px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 100%;
}

.header-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  -webkit-app-region: no-drag;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #F9FAFB;
  }

  &.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.minimize-btn:hover {
    background-color: #F0F2F5;
  }

  &  .close-btn:hover {
    background-color: #FFE6E6;
    transform: none;
  }

  .header-icon {
    width: 16px;
    height: 16px;
    opacity: 0.7;
    transition: all 0.2s ease;

    &.refreshing {
      animation: spin 1s linear infinite;
    }
  }

  &:hover .header-icon {
    opacity: 1;
  }
}
.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
