<template>
  <div class="message-video">
    <div :style="{ width: `${videoSize.width}px`, height: `${videoSize.height}px` }" class="video-container">
      <!-- 视频封面 -->
      <BeaverImage
        v-if="message.msg.videoMsg.thumbnailKey"
        :file-name="message.msg.videoMsg.thumbnailKey"
        alt="视频封面"
        image-class="video-thumbnail"
      />
      <!-- 播放按钮遮罩层 -->
      <div class="video-overlay" @click="handleVideoPlay">
        <div class="play-button">
          <img :src="playerSvg" alt="播放">
        </div>
        <!-- 视频时长 -->
        <div v-if="message.msg.videoMsg.duration" class="video-duration">
          {{ formattedDuration }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { previewOnlineFileApi } from 'renderModule/api/file'
import playerSvg from 'renderModule/assets/image/chat/play.svg'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { calculateImageSize } from 'renderModule/utils/image/index'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'VideoMessage',
  components: {
    BeaverImage,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // 计算视频尺寸
    const videoSize = computed(() => {
      if (props.message.msg.type === 3 && props.message.msg.videoMsg) {
        const videoMsg = props.message.msg.videoMsg
        if (videoMsg.width && videoMsg.height) {
          return calculateImageSize(videoMsg.width, videoMsg.height)
        }
      }
      // 如果没有尺寸信息，返回默认值
      return { width: 240, height: 135 }
    })

    // 格式化视频时长（秒 -> mm:ss）
    const formattedDuration = computed(() => {
      const duration = props.message.msg.videoMsg?.duration
      if (!duration)
        return ''
      const mins = Math.floor(duration / 60)
      const secs = duration % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    })

    // 处理视频播放
    const handleVideoPlay = async () => {
      const fileKey = props.message.msg.videoMsg?.fileKey
      if (!fileKey) {
        console.error('视频文件ID不能为空', props.message)
        return
      }

      try {
        // 获取视频URL（优先使用缓存，否则使用在线URL）
        let videoUrl = previewOnlineFileApi(fileKey)
        try {
          const cachedUrl = await electron.cache.get(CacheType.USER_VIDEO, fileKey)
          if (cachedUrl) {
            videoUrl = cachedUrl
          }
        }
        catch {
          // 缓存获取失败，使用在线URL
        }
        console.error('videoUrl', videoUrl)

        // 打开视频播放器窗口
        await electron.window.openWindow('video', {
          unique: true,
          params: {
            url: videoUrl,
            title: fileKey,
          },
        })
      }
      catch (error) {
        console.error('打开视频播放器失败:', error)
      }
    }

    return {
      videoSize,
      formattedDuration,
      handleVideoPlay,
      playerSvg,
    }
  },
})
</script>

<style lang="less" scoped>
.message-video {
  max-width: 240px;
  border-radius: 8px;
  overflow: hidden;

  .video-container {
    position: relative;
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;

    .video-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.3);
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.4);

        .play-button {
          transform: scale(1.1);
        }
      }

      .play-button {
        width: 56px;
        height: 56px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background-color 0.2s;

        img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          margin-left: 2px; // 视觉居中调整
          filter: brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(2000%) hue-rotate(350deg) brightness(1.1) contrast(1);
        }

        &:hover {
          background-color: rgba(255, 255, 255, 1);
        }
      }

      .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background-color: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
}
</style>
