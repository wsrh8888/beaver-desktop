<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

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
import Logger from 'renderModule/utils/logger'

const logger = new Logger('VideoPlayerView')

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
        logger.info({
          text: '视频加载完成',
          data: {
            duration: videoRef.value.duration,
            width: videoRef.value.videoWidth,
            height: videoRef.value.videoHeight,
          },
        })
      }
    }

    const handleVideoError = (e: Event) => {
      logger.error({ text: '视频加载失败', data: { error: e } })
    }

    // 监听notification更新
    const handleNotification = (payload: any) => {
      if (payload.command === NotificationMediaViewerCommand.UPDATE_VIDEO && payload.data) {
        videoUrl.value = payload.data.url || ''
        videoTitle.value = payload.data.title || ''
        logger.info({ text: '收到视频更新通知', data: { payload: payload.data } })
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
