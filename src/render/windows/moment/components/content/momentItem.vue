<template>
  <div class="moment-item" @click="handleMomentClick">
    <!-- Header区域：左右结构，左边头像，右边上下（昵称+时间） -->
    <div class="moment-header">
      <!-- 左侧头像 -->
      <div class="avatar-section">
        <BeaverImage
          :file-name="displayAvatar"
          :cache-type="CacheType.USER_AVATAR"
          class="user-avatar"
        />
      </div>

      <!-- 右侧用户信息 -->
      <div class="user-info">
        <div class="user-nickname">
          {{ displayUserName }}
        </div>
        <div class="moment-time">
          {{ formatMomentTime(moment.createdAt) }}
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="moment-content-section">
      <!-- 动态内容 -->
      <div v-if="moment.content" class="moment-content">
        {{ moment.content }}
      </div>

      <!-- 媒体文件9宫格 -->
      <div v-if="moment.files && moment.files.length > 0" class="media-section">
        <div class="media-grid" :class="getMediaGridClass(moment.files.length)">
          <div
            v-for="(file, index) in getDisplayFiles(moment.files)"
            :key="file.fileKey + index"
            class="media-item"
            :class="{ 'has-more': index === 8 && moment.files.length > 9 }"
          >
            <BeaverImage
              v-if="file.type === 2"
              :file-name="file.fileKey"
              :cache-type="CacheType.USER_IMAGE"
              class="media-image"
            />
            <div v-else class="media-file">
              <img src="renderModule/assets/image/common/file.svg" alt="文件" class="file-icon">
              <div class="file-name">
                {{ getFileName(file.fileKey) }}
              </div>
            </div>

            <!-- 更多图片遮罩 -->
            <div v-if="index === 8 && moment.files.length > 9" class="media-overlay">
              <div class="overlay-text">
                +{{ moment.files.length - 9 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 点赞、评论预览和操作 -->
    <div class="moment-footer">
      <div class="footer-top">
        <!-- 点赞信息 -->
        <div v-if="moment.likes && moment.likes.length > 0" class="likes-info">
          <img :src="SvgLikeActive" alt="点赞" class="like-icon">
          <span class="like-text">
            {{ getLikeDisplayText(moment.likes) }}
          </span>
        </div>
        <!-- 操作按钮 -->
        <div class="actions-section">
          <div class="action-btn" @click.stop="handleCommentClick">
            <img src="renderModule/assets/image/moment/comment.svg" alt="评论" class="action-icon">
            <span class="action-count">{{ commentCount || '评论' }}</span>
          </div>
          <div class="action-btn" @click.stop="handleLikeClick">
            <img :src="isLiked ? SvgLikeActive : SvgLike" alt="点赞" class="action-icon">
            <span class="action-count">{{ likeCount || '赞' }}</span>
          </div>
        </div>
      </div>

      <!-- 评论预览（列表接口只返回顶层3条） -->
      <div v-if="moment.comments && moment.comments.length > 0" class="comment-preview">
        <div
          v-for="c in moment.comments"
          :key="c.id"
          class="comment-line"
          @click.stop="handleCommentClick"
        >
          <div class="comment-avatar">
            <BeaverImage
              :file-name="getCommentAvatar(c)"
              :cache-type="CacheType.USER_AVATAR"
              class="comment-avatar-img"
            />
          </div>
          <div class="comment-body">
            <span class="comment-user">{{ getCommentName(c) }}</span>
            <span class="comment-text">：{{ c.content }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IMomentInfo } from 'commonModule/type/ajax/moment'
import { CacheType } from 'commonModule/type/cache/cache'
import SvgLikeActive from 'renderModule/assets/image/moment/like-active.svg'
import SvgLike from 'renderModule/assets/image/moment/like-default.svg'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useMomentStore } from 'renderModule/windows/moment/store/moment/moment'
import { useUserStore } from 'renderModule/windows/moment/store/user/user'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MomentItem',
  components: {
    BeaverImage,
  },
  props: {
    moment: {
      type: Object as () => IMomentInfo,
      required: true,
    },
  },
  emits: ['momentClick', 'like', 'comment'],
  setup(props, { emit }) {
    const momentStore = useMomentStore()
    const userStore = useUserStore()
    // 是否已点赞
    const isLiked = computed(() => {
      if (props.moment.isLiked !== undefined) {
        return props.moment.isLiked
      }
      const me = userStore.getUserId
      return props.moment.likes?.some(like => like.userId === me) || false
    })

    // 点赞数量
    const likeCount = computed(() => {
      if (props.moment.likeCount !== undefined) {
        return props.moment.likeCount
      }
      return props.moment.likes?.length || 0
    })

    // 评论数量
    const commentCount = computed(() => {
      if (props.moment.commentCount !== undefined) {
        return props.moment.commentCount
      }
      return props.moment.comments?.length || 0
    })

    // 获取显示的文件列表（最多9个）
    const getDisplayFiles = (files: any[]) => {
      return files.slice(0, 9)
    }

    // 获取媒体网格样式类
    const getMediaGridClass = (count: number) => {
      if (count === 1)
        return 'single'
      if (count === 2)
        return 'double'
      if (count === 3)
        return 'triple'
      if (count === 4)
        return 'quad'
      return 'multiple'
    }

    // 获取点赞显示文本（最多6个，超过显示...）
    const getLikeDisplayText = (likes: any[]) => {
      if (!likes || likes.length === 0)
        return ''
      const names = likes
        .slice(0, 6)
        .map((like) => {
          const info = userStore.getContact(like.userId || '')
          return info.nickName || like.userName || like.nickName
        })
      const displayText = names.join('，')
      return likes.length > 6 ? `${displayText}...` : displayText
    }

    // 处理动态点击
    const handleMomentClick = () => {
      emit('momentClick', props.moment)
    }

    // 处理点赞点击
    const handleLikeClick = () => {
      momentStore.toggleLike(props.moment.id)
    }

    // 处理评论点击
    const handleCommentClick = () => {
      emit('comment', props.moment.id)
    }

    // 格式化时间
    const formatMomentTime = (timeStr: string) => {
      if (!timeStr)
        return ''
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1)
        return '刚刚'
      if (minutes < 60)
        return `${minutes}分钟前`
      if (hours < 24)
        return `${hours}小时前`
      if (days < 30)
        return `${days}天前`

      return date.toLocaleDateString()
    }

    // 文件类型判断
    const isImageFile = (fileName: string) => {
      const ext = fileName.split('.').pop()?.toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')
    }

    // 获取文件名
    const getFileName = (fileName: string) => {
      return fileName.split('/').pop() || '未知文件'
    }

    // 处理媒体错误
    const handleMediaError = (event: Event) => {
      const element = event.target as HTMLElement
      element.style.display = 'none'
    }

    const displayUserName = computed(() => {
      const info = userStore.getContact(props.moment.userId)
      return info.nickName || props.moment.userName || props.moment.nickName
    })
    const displayAvatar = computed(() => {
      const info = userStore.getContact(props.moment.userId)
      return info.avatar || props.moment.avatar
    })

    const getCommentName = (c: any) => {
      const info = userStore.getContact(c.userId || '')
      return info.nickName || c.userName || c.nickName
    }
    const getCommentAvatar = (c: any) => {
      const info = userStore.getContact(c.userId || '')
      return info.avatar || c.avatar
    }

    return {
      isLiked,
      likeCount,
      commentCount,
      displayUserName,
      displayAvatar,
      getCommentName,
      getCommentAvatar,
      getDisplayFiles,
      getMediaGridClass,
      formatMomentTime,
      getLikeDisplayText,
      handleMomentClick,
      handleLikeClick,
      handleCommentClick,
      isImageFile,
      getFileName,
      CacheType,
      handleMediaError,
      SvgLikeActive,
      SvgLike,
    }
  },
})
</script>

<style lang="less" scoped>
.moment-item {
  position: relative;
  background: #FFFFFF;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;

}

/* Header区域 */
.moment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

/* 左侧头像区域 */
.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* 右侧用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

/* 用户昵称 */
.user-nickname {
  font-size: 12px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
  line-height: 1.2;
}

/* 内容区域 */
.moment-content-section {
  margin-bottom: 12px;
}

/* 动态内容 */
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
      width: 100%;
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

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改为contain，确保完整显示 */
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

/* Footer区域：点赞和操作区域 */
.moment-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;

  .footer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .likes-info {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 8px 12px;
      background-color: #F8F8F8;
      border-radius: 6px;
      flex: 1;
    }

    .actions-section {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
  }

  .comment-preview {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 12px;
    background: #f9f9f9;
    border-radius: 6px;

    .comment-line {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .comment-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;

        .comment-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      }

      .comment-body {
        font-size: 13px;
        color: #333333;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 2px;

        .comment-user {
          font-weight: 500;
          color: #576b95;
        }
        .comment-text {
          color: #333333;
        }
      }

      &:hover {
        color: #ff7d45;
      }
    }

    .comment-more {
      font-size: 12px;
      color: #999999;
      cursor: pointer;

      &:hover {
        color: #ff7d45;
      }
    }
  }

}

.like-icon {
  width: 14px;
  height: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.like-text {
  font-size: 13px;
  color: #333333;
  line-height: 1.4;
  word-break: break-all;
}

/* 右侧操作按钮 */
.actions-section {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #666666;

}

.action-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.action-count {
  font-size: 12px;
  color: #999999;
  margin-left: 2px;
}/* 响应式设计 */
@media (max-width: 480px) {
  .moment-item {
    padding: 12px;
  }

  .user-nickname {
    font-size: 15px;
  }

  .moment-content {
    font-size: 14px;
  }

  .moment-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .likes-info {
    margin-right: 0;
  }
}
</style>
