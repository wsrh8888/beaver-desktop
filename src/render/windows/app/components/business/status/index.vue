<template>
  <div class="app-status">
    <!-- 消息列表顶部的状态条 -->
    <div v-if="isLoading" class="message-status-bar">
      <div class="status-icon">
        <div class="mini-spinner" />
      </div>
      <div class="status-content">
        <div class="status-text">
          {{ lifecycleStatusText }}
        </div>
        <!-- 重试按钮 - 在连接失败或同步失败时显示 -->
        <button
          v-if="appStore.lifecycleStatus === 'connect_error' || appStore.lifecycleStatus === 'sync_error'"
          class="retry-button"
          @click="handleRetry"
        >
          {{ appStore.lifecycleStatus === 'connect_error' ? '重连' : '重试' }}
        </button>
      </div>
    </div>

    <!-- 聊天内容区域的loading状态 -->
    <div v-if="appStore.lifecycleStatus === 'syncing'" class="chat-content-loading">
      <div class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring" />
          <div class="spinner-ring" />
          <div class="spinner-ring" />
        </div>
        <div class="loading-text">
          正在同步数据...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../../pinia/app/app'

const appStore = useAppStore()

// 组件内部的状态转换逻辑
const lifecycleStatusText = computed(() => {
  switch (appStore.lifecycleStatus) {
    case 'connecting': return '连接中'
    case 'syncing': return '同步中'
    case 'ready': return '就绪'
    case 'disconnected': return '未连接'
    case 'connect_error': return '连接服务器失败'
    case 'sync_error': return '数据同步失败'
    default: return '未知状态'
  }
})

const isLoading = computed(() => {
  return ['connecting', 'syncing', 'connect_error', 'sync_error'].includes(appStore.lifecycleStatus)
})

// 重试操作
const handleRetry = async () => {
  try {
    const currentStatus = appStore.lifecycleStatus

    if (currentStatus === 'connect_error') {
      // 连接错误：重新连接WebSocket
      appStore.updateLifecycleStatus('connecting')
      await window.electron.websocket.reconnect()
      console.log('重新连接WebSocket')
    }
    else if (currentStatus === 'sync_error') {
      // 同步错误：重新执行数据同步
      appStore.updateLifecycleStatus('syncing')
      const result = await window.electron.datasync.manualSync()
      if (result) {
        console.log('手动同步成功')
      }
    }
  }
  catch (error) {
    console.error('重试失败:', error)
    // 错误状态会通过通知自动更新
  }
}
</script>

<style scoped>
/* AppStatus 根容器 */
.app-status {
  position: relative;
}

/* 消息列表顶部的状态条 - 根据设计规范优化 */
.message-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  background: #FFE6D9; /* 品牌色浅色变体 */
  border-bottom: 1px solid rgba(255, 125, 69, 0.2); /* 品牌色半透明分割线 */
  font-size: 13px; /* 正文字体大小 */
  color: #E86835; /* 深橙色 */
  font-weight: 500; /* 中粗字重 */
  animation: slideDown 0.3s ease-out;
}

.status-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 125, 69, 0.3);
  border-top: 2px solid #FF7D45; /* 品牌主色 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.status-text {
  font-weight: 500;
  white-space: nowrap;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-button {
  padding: 4px 8px;
  background: #FF7D45;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #E86835;
  }

  &:active {
    background: #D55A2B;
  }
}

/* 聊天内容区域的loading状态 */
.chat-content-loading {
  position: fixed;
  top: 0;
  left: 348px; /* 68px(导航栏) + 280px(消息列表) */
  right: 0;
  bottom: 0;
  z-index: 15;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
  animation: fadeIn 0.3s ease-in-out;
}

.loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007acc;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) { animation-delay: -0.45s; }
.spinner-ring:nth-child(2) { animation-delay: -0.3s; }
.spinner-ring:nth-child(3) { animation-delay: -0.15s; }

.loading-text {
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* 同步进度 */
.sync-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  max-width: 200px;
}

.progress-fill {
  height: 100%;
  background: #007acc;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 32px;
  text-align: right;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .message-status-bar {
    background: rgba(232, 104, 53, 0.1); /* 深橙色半透明 */
    border-bottom-color: rgba(232, 104, 53, 0.3);
    color: #E86835; /* 深橙色 */
  }

  .mini-spinner {
    border-color: rgba(232, 104, 53, 0.3);
    border-top-color: #FF7D45; /* 保持品牌色 */
  }

  .loading-overlay {
    background: rgba(30, 32, 34, 0.95); /* 深色背景 */
    backdrop-filter: blur(2px);
  }

  .loading-text {
    color: #F0F3F4; /* 暗色文本 */
  }

  .progress-bar {
    background: #3D4548; /* 暗色分割线 */
  }

  .progress-text {
    color: #F0F3F4; /* 暗色文本 */
  }
}
</style>
