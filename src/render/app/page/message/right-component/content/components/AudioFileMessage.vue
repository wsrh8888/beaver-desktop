<template>
  <div class="audio-file-message">
    <!-- 顶部蓝色区域：Audio标识 -->
    <div class="audio-header">
      <div class="audio-icon">
        <img :src="AudioIconSvg" alt="Audio" />
      </div>
      <span class="audio-label">Audio</span>
    </div>
    <!-- 底部白色区域：文件信息 -->
    <div class="audio-content">
      <div class="file-info">
        <div class="file-name" :title="fileName">{{ fileName }}</div>
        <div v-if="fileSize" class="file-size">{{ formatFileSize(fileSize) }}</div>
      </div>
      <div class="file-actions">
        <!-- 播放按钮 -->
        <div class="action-btn play-btn" @click.stop="handlePlay">
          <img :src="playerSvg" alt="播放" />
        </div>
        <!-- 下载按钮 -->
        <div class="action-btn download-btn" @click.stop="handleDownload">
          <img :src="downloadSvg" alt="下载" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import downloadSvg from 'renderModule/assets/image/chat/download.svg'
import AudioIconSvg from 'renderModule/assets/image/chat/audio-icon.svg'
import playerSvg from 'renderModule/assets/image/chat/play.svg'

export default defineComponent({
  name: 'AudioFileMessage',
  components: {
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // 获取文件名
    const fileName = computed(() => {
      return props.message.msg.audioFileMsg?.fileName || '未知文件'
    })

    // 获取文件大小
    const fileSize = computed(() => {
      return props.message.msg.audioFileMsg?.size || null
    })

    // 格式化文件大小
    const formatFileSize = (bytes: number | null | undefined): string => {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    }

    // 处理播放
    const handlePlay = () => {
      const fileKey = props.message.msg.audioFileMsg?.fileName
      console.log('播放音频文件:', fileKey)
      // TODO: 创建新进程播放音频文件
    }

    // 处理下载
    const handleDownload = () => {
      const fileKey = props.message.msg.audioFileMsg?.fileName
      console.log('下载文件:', fileKey)
      // TODO: 实现文件下载功能
    }

    return {
      fileName,
      fileSize,
      formatFileSize,
      handlePlay,
      handleDownload,
      downloadSvg,
      AudioIconSvg,
      playerSvg,
    }
  },
})
</script>

<style lang="less" scoped>
.audio-file-message {
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  // 顶部蓝色区域
  .audio-header {
    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    padding: 20px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;

    // 背景图案（几何图案）
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 8px,
          rgba(255, 255, 255, 0.03) 8px,
          rgba(255, 255, 255, 0.03) 16px
        );
      opacity: 0.5;
    }

    .audio-icon {
      width: 36px;
      height: 36px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .audio-label {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      position: relative;
      z-index: 1;
      letter-spacing: 0.5px;
    }
  }

  // 底部白色区域
  .audio-content {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .file-info {
      flex: 1;
      min-width: 0;

      .file-name {
        font-size: 14px;
        color: #2D3436;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 6px;
        font-weight: 500;
        line-height: 1.4;
      }

      .file-size {
        font-size: 12px;
        color: #999;
        line-height: 1.2;
      }
    }

    .file-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .action-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;

        img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          transform: scale(1.1);
        }

        &:active {
          transform: scale(0.95);
        }

        &.play-btn {
          img {
            filter: brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(2000%) hue-rotate(350deg) brightness(1.1) contrast(1);
          }

          &:hover {
            background-color: rgba(255, 125, 69, 0.1);
          }
        }

        &.download-btn {
          img {
            filter: brightness(0) saturate(100%) invert(40%);
          }

          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
  }
}
</style>

