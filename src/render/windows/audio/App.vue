<template>
  <div class="audio__content">
    <!-- 标题栏 -->
    <div class="titlebar">
      <div class="title">
        音频播放
      </div>
      <button class="close-btn" @click="handleClose">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>

    <!-- 主要内容 -->
    <div class="audio__main">
      <AudioPlayer :audio-url="audioUrl" :audio-title="audioTitle" />
    </div>
  </div>
</template>

<script lang="ts">
import { NotificationModule } from 'commonModule/type/preload/notification'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import AudioPlayer from './views/index.vue'

export default defineComponent({
  components: {
    AudioPlayer,
  },
  setup() {
    const audioUrl = ref('')
    const audioTitle = ref('')

    const handleClose = () => {
      electron?.window.closeWindow('audio', { hideOnly: true })
    }

    // 更新音频内容
    const updateAudio = (data: { url?: string; title?: string }) => {
      if (data.url) {
        audioUrl.value = data.url
      }
      if (data.title !== undefined) {
        audioTitle.value = data.title
      }
    }

    // 从 URL 参数获取音频信息
    const loadFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const url = urlParams.get('url')
      const title = urlParams.get('title')

      if (url) {
        audioUrl.value = decodeURIComponent(url)
      }
      if (title) {
        audioTitle.value = decodeURIComponent(title)
      }
    }

    // 监听notification更新
    const handleNotification = (payload: any) => {
      if (payload.command === 'updateAudio' && payload.data) {
        updateAudio(payload.data)
      }
    }

    onMounted(() => {
      loadFromUrl()
      // 监听notification
      electron?.notification.on(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    onUnmounted(() => {
      electron?.notification.off(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    return {
      audioUrl,
      audioTitle,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.audio__content {
  width: 100%;
  height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: drag;
}

/* 标题栏 */
.titlebar {
  height: 40px;
  background-color: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag;
  flex-shrink: 0;

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
    -webkit-app-region: drag;
  }

  .close-btn {
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;

    img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    &:hover img {
      opacity: 1;
    }
  }
}

// 主要内容区域
.audio__main {
  flex: 1;
  overflow: hidden;
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
</style>

