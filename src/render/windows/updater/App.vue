<template>
  <div class="update-window">
    <!-- 头部 -->
    <div class="update-header">
      <div class="app-icon">
        <img src="commonModule/assets/img/logo/logo.png" alt="Beaver Logo">
      </div>
      <div class="header-info">
        <h2 class="update-title">海狸 有可用更新</h2>
        <p class="update-subtitle">我们推荐您更新到最新版本，以获得更好的使用体验和安全性提升</p>
        <div class="version-info">
          <span class="version-badge current-version">当前版本: v{{currentVersion}}</span>
          <span class="version-arrow">→</span>
          <span class="version-badge new-version">新版本: v{{ updateInfo.version }}</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="update-content">
      <h3 class="content-title">更新内容</h3>
      <ul class="feature-list">
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
        <li class="feature-item" v-if="updateInfo.releaseNotes">
          <span class="feature-bullet">•</span>
          <span>{{ updateInfo.releaseNotes }}</span>
        </li>
      </ul>
    </div>

    <!-- 进度区域 -->
    <div class="update-progress">
      <!-- 空闲状态 -->
      <div class="update-status" :class="{ active: updateStatus === 'idle' }">
        <!-- 保持高度稳定 -->
      </div>

      <!-- 下载状态 -->
      <div class="update-status" :class="{ active: updateStatus === 'downloading' }">
        <div class="progress-info">
          <span class="progress-text">{{ downloadProgress === 100 ? '下载完成' : '正在下载更新...' }}</span>
          <span class="progress-percentage">{{ downloadProgress }}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: downloadProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="update-actions">
      <div class="action-buttons-container">
        <!-- 空闲状态按钮 -->
        <div class="button-set" :class="{ active: updateStatus === 'idle' }">
          <BeaverButton type="default" size="small" @click="handleClose">
            稍后再说
          </BeaverButton>
          <BeaverButton type="primary" size="small" @click="handleUpdate">
            <template #icon>
              <img src="renderModule/assets/image/update/download.svg" alt="download">
            </template>
            立即下载
          </BeaverButton>
        </div>

        <!-- 下载状态按钮 -->
        <div class="button-set" :class="{ active: updateStatus === 'downloading' }">
          <BeaverButton type="default" size="small" @click="handleCancel">
            取消下载
          </BeaverButton>
          <BeaverButton type="primary" size="small" :disabled="true">
            <template #icon>
              <img src="renderModule/assets/image/update/download.svg" alt="download">
            </template>
            下载中...
          </BeaverButton>
        </div>

        <!-- 完成状态按钮 -->
        <div class="button-set" :class="{ active: updateStatus === 'completed' }">
          <BeaverButton type="default" size="small" @click="handleClose">
            稍后安装
          </BeaverButton>
          <BeaverButton type="success" size="small" @click="handleRestart">
            <template #icon>
              <img src="renderModule/assets/image/update/restart.svg" alt="restart">
            </template>
            立即安装
          </BeaverButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import { NotificationModule } from 'commonModule/type/preload/notification'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'UpdaterApp',
  components: {
    BeaverButton,
  },
  setup() {
    const updateInfo = ref({
      version: '',
      fileKey: '',
      size: 0,
      description: '',
      releaseNotes: '',
    })

    const updateStatus = ref<'idle' | 'downloading' | 'completed'>('idle')
    const downloadProgress = ref(0)
    const autoUpdate = ref(false)


    // 监听notification更新
    const handleNotification = (payload: any) => {
      if (payload.command === 'updateInfo' && payload.data) {
        updateInfo.value = { ...updateInfo.value, ...payload.data }
        checkLocalUpdateFile()

      }
    }

    // 开始更新
    const handleUpdate = () => {
      updateStatus.value = 'downloading'
      downloadProgress.value = 0

      // 构建下载参数
      const downloadOptions = {
        fileKey: updateInfo.value.fileKey, // 直接使用 fileKey
        md5: updateInfo.value.md5,
        version: updateInfo.value.version
      }

      // 调用真实的下载功能
      electron?.update.downloadUpdate(downloadOptions, (progress: number) => {
        downloadProgress.value = progress
        if (progress >= 100) {
          setTimeout(() => {
            updateStatus.value = 'completed'
          }, 500)
        }
      })
    }

    // 取消下载
    const handleCancel = () => {
      // TODO: 调用取消下载的API
      updateStatus.value = 'idle'
      downloadProgress.value = 0
    }

    // 重启应用
    const handleRestart = () => {
      // 构建重启参数
      const restartOptions = {
        fileKey: updateInfo.value.fileKey,
        md5: updateInfo.value.md5,
        version: updateInfo.value.version
      }

      // 调用重启升级
      electron?.update.startUpdate(restartOptions)
    }

    // 关闭窗口
    const handleClose = () => {
      electron?.window.closeWindow()
    }

    // 切换自动更新
    const toggleAutoUpdate = () => {
      autoUpdate.value = !autoUpdate.value
    }

    // 检查本地是否已有更新文件
    const checkLocalUpdateFile = async () => {
      try {
        // 检查缓存数据库中是否有这个文件的记录
        const result = await electron?.cache.get('PUBLIC_UPDATE', updateInfo.value.fileKey)
        console.error('检查本地更新文件:', result)
        // 如果返回的是本地路径（而不是在线URL），说明文件已存在
        if (result && result.includes('file://')) {
          updateStatus.value = 'completed'
          downloadProgress.value = 100
        } else {
          updateStatus.value = 'idle'
          downloadProgress.value = 0
        }
      } catch (error) {
        console.error('检查本地更新文件失败:', error)
        updateStatus.value = 'idle'
      }
    }

    // 生命周期
    onMounted(async () => {
      electron?.notification.on(NotificationModule.MEDIA_VIEWER, handleNotification)

    })

    onUnmounted(() => {
      electron?.notification.off(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    const currentVersion = electron?.app.version
    return {
      currentVersion,
      updateInfo,
      updateStatus,
      downloadProgress,
      autoUpdate,
      handleUpdate,
      handleCancel,
      handleRestart,
      handleClose,
      toggleAutoUpdate,
      
    }
  }
})
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "SF Pro", "PingFang SC", "微软雅黑", sans-serif;
  user-select: none;
}

body {
  background-color: #F9FAFB;
  color: #2D3436;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.update-window {
  width: 480px;
  height: 100%;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.update-header {
  display: flex;
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.app-icon {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  overflow: hidden;
}

.app-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.header-info {
  flex: 1;
}

.update-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.update-subtitle {
  font-size: 13px;
  color: #636E72;
  margin-bottom: 12px;
  line-height: 1.4;
}

.version-info {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.version-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.current-version {
  background-color: #F2F2F2;
  color: #636E72;
}

.version-arrow {
  margin: 0 8px;
  color: #B2BEC3;
}

.new-version {
  background-color: #FFE6D9;
  color: #FF7D45;
}

.update-content {
  padding: 12px 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* 允许 flex 子项缩小 */
}

.update-content::-webkit-scrollbar {
  width: 8px;
  margin-right: 5px;
}

.update-content::-webkit-scrollbar-track {
  background: #F9FAFB;
  margin: 4px 3px;
}

.update-content::-webkit-scrollbar-thumb {
  background: #B2BEC3;
  border-radius: 4px;
  margin: 4px 3px;
}

.content-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2D3436;
}

.feature-list {
  list-style-type: none;
}

.feature-item {
  display: flex;
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.5;
  color: #636E72;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-bullet {
  color: #FF7D45;
  margin-right: 8px;
  flex-shrink: 0;
}

.update-progress {
  padding: 0 20px;
  margin: 10px 0;
  height: 40px; /* 固定高度，避免抖动 */
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 12px;
  color: #636E72;
}

.progress-percentage {
  font-size: 12px;
  font-weight: 500;
  color: #FF7D45;
}

.progress-bar-container {
  height: 4px;
  background-color: #F2F2F2;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  width: 0%;
}

.update-options {
  padding: 0 20px 12px;
}

.auto-update-option {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #636E72;
  height: 20px; /* 固定高度，避免抖动 */
}

.checkbox {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  border: 1px solid #B2BEC3;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.checkbox.checked {
  background-color: #FF7D45;
  border-color: #FF7D45;
}

.checkbox.checked::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  top: 1px;
  left: 4px;
  transform: rotate(45deg);
}

.update-actions {
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #EBEEF5;
  height: 56px; /* 固定高度，避免抖动 */
}

.action-buttons-container {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 12px;
}

.button-set {
  position: absolute;
  transition: opacity 0.3s ease;
  opacity: 0;
  pointer-events: none;
  display: flex;
  gap: 12px;
}

.button-set.active {
  opacity: 1;
  pointer-events: all;
}


/* 按钮图标样式 */
.beaver-button__icon img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1E2022;
  }

  .update-window {
    background-color: #2D3436;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }

  .update-header {
    border-bottom: 1px solid #3D4548;
  }

  .update-title {
    color: #F0F3F4;
  }

  .update-subtitle {
    color: #B2BEC3;
  }

  .current-version {
    background-color: #3D4548;
    color: #B2BEC3;
  }

  .content-title {
    color: #F0F3F4;
  }

  .feature-item {
    color: #B2BEC3;
  }

  .progress-bar-container {
    background-color: #3D4548;
  }

  .update-actions {
    border-top: 1px solid #3D4548;
  }

  .secondary-button {
    background-color: #3D4548;
    color: #F0F3F4;
  }

  .secondary-button:hover {
    background-color: #4A5356;
  }

  .auto-update-option {
    color: #B2BEC3;
  }

  .checkbox {
    border-color: #636E72;
  }

  .update-content::-webkit-scrollbar-track {
    background: #3D4548;
  }

  .update-content::-webkit-scrollbar-thumb {
    background: #636E72;
  }
}
</style>
