<template>
  <div class="moment-content-card">
    <!-- Header区域：头像 + 用户信息 -->
    <div class="card-header">
      <div class="avatar-section">
        <slot name="avatar">
          <BeaverImage
            v-if="avatar"
            :file-name="avatar"
            :cache-type="CacheType.USER_AVATAR"
            class="user-avatar"
          />
          <div v-else class="avatar-placeholder">
            <img src="renderModule/assets/image/common/default-avatar.svg" alt="默认头像" class="default-avatar">
          </div>
        </slot>
      </div>

      <div class="user-info">
        <div class="user-nickname">
          <slot name="nickname">{{ userName || nickName || '未知用户' }}</slot>
        </div>
        <div class="moment-time">
          <slot name="time">{{ formatTime(createdAt) }}</slot>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="card-content">
      <slot name="content">
        <!-- 默认内容区域 -->
        <div v-if="content" class="moment-content">{{ content }}</div>

        <!-- 媒体文件区域 -->
        <div v-if="files && files.length > 0" class="media-section">
          <div class="media-grid" :class="getMediaGridClass(files.length)">
            <div
              v-for="(file, index) in getDisplayFiles(files)"
              :key="file.fileKey + index"
              class="media-item"
              :class="{ 'has-more': index === 8 && files.length > 9 }"
              @click="$emit('mediaClick', file, files)"
            >
              <BeaverImage
                v-if="file.type === 2"
                :file-name="file.fileKey"
                :cache-type="CacheType.USER_IMAGE"
                class="media-image"
              />
              <div v-else class="media-file">
                <img src="renderModule/assets/image/moment/file.svg" alt="文件" class="file-icon">
                <div class="file-name">{{ getFileName(file.fileKey) }}</div>
              </div>

              <div v-if="index === 8 && files.length > 9" class="media-overlay">
                <div class="overlay-text">+{{ files.length - 9 }}</div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { CacheType } from 'commonModule/type/cache/cache'

export default defineComponent({
  name: 'MomentContentCard',
  components: {
    BeaverImage,
  },
  props: {
    // 用户信息
    userName: {
      type: String,
      default: ''
    },
    nickName: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    createdAt: {
      type: String,
      default: ''
    },
    // 内容信息
    content: {
      type: String,
      default: ''
    },
    files: {
      type: Array,
      default: () => []
    }
  },
  emits: ['mediaClick'],
  setup() {
    // 获取显示的文件列表（最多9个）
    const getDisplayFiles = (files: any[]) => {
      return files.slice(0, 9)
    }

    // 获取媒体网格样式类
    const getMediaGridClass = (count: number) => {
      if (count === 1) return 'single'
      if (count === 2) return 'double'
      if (count === 3) return 'triple'
      if (count === 4) return 'quad'
      return 'multiple'
    }

    // 获取文件名
    const getFileName = (fileName: string) => {
      return fileName.split('/').pop() || '未知文件'
    }

    // 格式化时间
    const formatTime = (timeStr: string) => {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 30) return `${days}天前`

      return date.toLocaleDateString()
    }

    return {
      getDisplayFiles,
      getMediaGridClass,
      getFileName,
      formatTime,
      CacheType,
    }
  }
})
</script>

<style lang="less" scoped>
.moment-content-card {
  /* 基础样式 - 作为子组件使用时简化样式 */
}

/* Header区域 */
.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

/* 左侧头像区域 */
.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;

  .default-avatar {
    width: 24px;
    height: 24px;
    opacity: 0.6;
  }
}

/* 右侧用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
  line-height: 1.2;
}

.moment-time {
  font-size: 12px;
  color: #999999;
  line-height: 1.2;
}

/* 内容区域 */
.card-content {
  /* 内容样式 */
}

.moment-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333333;
  margin-bottom: 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 媒体文件区域 */
.media-section {
  margin-bottom: 12px;
}

.media-grid {
  display: grid;
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;

  &.single {
    grid-template-columns: 1fr;
    max-width: 320px;

    .media-item {
      max-height: 320px;
    }
  }

  &.double {
    grid-template-columns: 1fr 1fr;
    height: 120px;
    max-width: 320px;
  }

  &.triple {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    height: 180px;
    max-width: 320px;

    .media-item:first-child {
      grid-row: 1 / -1;
    }
  }

  &.quad {
    grid-template-columns: 1fr 1fr;
    height: 120px;
    max-width: 320px;
  }

  &.multiple {
    grid-template-columns: repeat(3, 1fr);
    height: 120px;
    max-width: 320px;
  }
}

.media-item {
  position: relative;
  background: #F5F5F5;
  overflow: hidden;
  cursor: pointer;
  border-radius: 4px;
  min-height: 80px;

  &.has-more {
    cursor: default;
  }
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #F5F5F5;
}

.media-file {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #F5F5F5;
  border-radius: 4px;

  .file-icon {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
    opacity: 0.6;
  }

  .file-name {
    font-size: 11px;
    color: #666666;
    text-align: center;
    word-break: break-all;
    line-height: 1.2;
  }
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
}
</style>
