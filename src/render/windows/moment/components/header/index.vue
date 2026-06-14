<template>
  <div class="moment-header">
    <div class="header-content">
      <div class="header-left">
        <button class="header-btn message-btn" @click="handleOpenMessages">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span v-if="notificationStore.unreadCount > 0" class="message-badge">
            {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
          </span>
        </button>
        <!-- 刷新按钮 -->
        <button class="header-btn refresh-btn" @click="handleRefresh">
          <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="header-icon" :class="{ refreshing: isRefreshing }">
        </button>
      </div>

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
import { defineComponent, onMounted, ref } from 'vue'
import { useMomentNotificationStore } from '../../store/notification/notification'

export default defineComponent({
  name: 'MomentHeader',
  setup() {
    const isRefreshing = ref(false)
    const notificationStore = useMomentNotificationStore()

    onMounted(() => {
      notificationStore.refreshUnreadCount()
    })

    const handleOpenMessages = () => {
      notificationStore.openMessagesPanel()
    }

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
      notificationStore,
      handleOpenMessages,
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

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-btn {
  position: relative;
  color: #636E72;
}

.message-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #FF4757;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  font-weight: 600;
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
