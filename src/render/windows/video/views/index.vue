<template>
  <div class="video-player">
    <div v-if="videoUrl" class="video-container">
      <video
        ref="videoRef"
        :src="videoUrl"
        class="player-video"
        controls
        @loadedmetadata="handleLoadedMetadata"
        @error="handleVideoError"
      >
        您的浏览器不支持视频播放
      </video>
      <div v-if="videoTitle" class="video-title">
        {{ videoTitle }}
      </div>
    </div>
    <div v-else class="empty-state">
      <p>未找到视频</p>
    </div>
  </div>
</template>

<script lang="ts">
import { NotificationMediaViewerCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  name: 'VideoPlayer',
  props: {
    videoUrl: {
      type: String,
      default: '',
    },
    videoTitle: {
      type: String,
      default: '',
    },
  },
  setup() {
    const videoRef = ref<HTMLVideoElement | null>(null)
    const videoUrl = ref('')
    const videoTitle = ref('')

    const handleLoadedMetadata = () => {
      if (videoRef.value) {
        console.log('视频加载完成', {
          duration: videoRef.value.duration,
          width: videoRef.value.videoWidth,
          height: videoRef.value.videoHeight,
        })
      }
    }

    const handleVideoError = (e: Event) => {
      console.error('视频加载失败', e)
    }

    // 监听notification更新
    const handleNotification = (payload: any) => {
      if (payload.command === NotificationMediaViewerCommand.UPDATE_VIDEO && payload.data) {
        videoUrl.value = payload.data.url || ''
        videoTitle.value = payload.data.title || ''
        console.log('收到视频更新通知:', payload.data)
      }
    }

    // 键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.value)
        return

      if (e.key === 'Escape') {
        electron?.window.closeWindow('video', { hideOnly: true })
      }
      else if (e.key === ' ') {
        e.preventDefault()
        if (videoRef.value.paused) {
          videoRef.value.play()
        }
        else {
          videoRef.value.pause()
        }
      }
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (videoRef.value) {
          videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10)
        }
      }
      else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (videoRef.value) {
          videoRef.value.currentTime = Math.min(
            videoRef.value.duration,
            videoRef.value.currentTime + 10,
          )
        }
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      electron?.notification.on(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
      electron?.notification.off(NotificationModule.MEDIA_VIEWER, handleNotification)
    })

    return {
      videoRef,
      videoUrl,
      videoTitle,
      handleLoadedMetadata,
      handleVideoError,
    }
  },
})
</script>

<style lang="less" scoped>
.video-player {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.player-video {
  max-width: 100%;
  max-height: calc(100% - 40px);
  object-fit: contain;
  outline: none;
}

.video-title {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  max-width: 80%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  color: #F0F3F4;
  font-size: 14px;
}
</style>
