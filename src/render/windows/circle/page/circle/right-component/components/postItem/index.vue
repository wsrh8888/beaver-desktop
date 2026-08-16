<template>
  <div class="circle-post-item">
    <div class="circle-post-item-head">
      <div class="circle-post-item-avatar">
        <BeaverImage
          v-if="post.avatar"
          :file-name="post.avatar"
          :cache-type="CacheType.USER_AVATAR"
          alt="头像"
          image-class="circle-post-item-avatar-img"
        />
      </div>
      <div class="circle-post-item-meta">
        <div class="circle-post-item-name">
          {{ post.userName }}
        </div>
        <div class="circle-post-item-time">
          {{ formatTime(post.createdAt) }}
        </div>
      </div>
    </div>

    <div v-if="post.content" class="circle-post-item-content" @click="$emit('comment')">
      {{ post.content }}
    </div>

    <div v-if="post.files && post.files.length" class="circle-post-item-media">
      <div
        class="circle-post-item-media-grid"
        :class="`count-${Math.min(post.files.length, 9)}`"
      >
        <div
          v-for="(file, index) in displayFiles"
          :key="file.fileKey + index"
          class="circle-post-item-media-item"
          @click.stop="handleMediaClick(index)"
        >
          <BeaverImage
            v-if="file.type === 2"
            :file-name="file.fileKey"
            :cache-type="CacheType.USER_IMAGE"
            alt="图片"
            image-class="circle-post-item-media-img"
          />
        </div>
      </div>
    </div>

    <div class="circle-post-item-actions">
      <button
        class="circle-post-item-action"
        :class="{ active: post.isLiked }"
        type="button"
        @click="$emit('like')"
      >
        <img
          :src="post.isLiked ? likeActiveIcon : likeIcon"
          alt="点赞"
        >
        <span>{{ post.likeCount || 0 }}</span>
      </button>
      <button
        class="circle-post-item-action"
        type="button"
        @click="$emit('comment')"
      >
        <img src="renderModule/assets/image/moment/comment.svg" alt="评论">
        <span>{{ post.commentCount || 0 }}</span>
      </button>
    </div>

    <div v-if="post.comments && post.comments.length" class="circle-post-item-comments">
      <div
        v-for="item in post.comments"
        :key="item.commentId"
        class="circle-post-item-comment"
        @click="$emit('comment')"
      >
        <span class="circle-post-item-comment-name">{{ item.userName }}</span>
        <span class="circle-post-item-comment-text">：{{ item.content }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ICirclePostItem } from 'commonModule/type/ajax/circle'
import { CacheType } from 'commonModule/type/cache/cache'
import { computed, defineComponent } from 'vue'
import likeIcon from 'renderModule/assets/image/moment/like-default.svg'
import likeActiveIcon from 'renderModule/assets/image/moment/like-active.svg'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'CirclePostItem',
  components: { BeaverImage },
  props: {
    post: {
      type: Object as () => ICirclePostItem,
      required: true,
    },
  },
  emits: ['like', 'comment'],
  setup(props) {
    const displayFiles = computed(() => (props.post.files || []).slice(0, 9))

    const formatTime = (value: string) => {
      if (!value)
        return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime()))
        return value
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const handleMediaClick = async (index: number) => {
      const list = (props.post.files || [])
        .filter(item => item.type === 2)
        .map(item => item.fileKey)
      if (!list.length)
        return
      try {
        await electron.window.openWindow('image', {
          unique: true,
          params: {
            url: list[index] || list[0],
            list,
            index,
          },
        })
      }
      catch (error) {
        console.error('打开图片查看器失败:', error)
      }
    }

    return {
      CacheType,
      likeIcon,
      likeActiveIcon,
      displayFiles,
      formatTime,
      handleMediaClick,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-post-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.circle-post-item-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.circle-post-item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  background: #F0F2F5;
  flex-shrink: 0;
}

.circle-post-item-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-post-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
}

.circle-post-item-time {
  margin-top: 2px;
  font-size: 12px;
  color: #636E72;
}

.circle-post-item-content {
  font-size: 14px;
  line-height: 1.6;
  color: #2D3436;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: pointer;
}

.circle-post-item-media {
  margin-top: 12px;
}

.circle-post-item-media-grid {
  display: grid;
  gap: 6px;

  &.count-1 {
    grid-template-columns: minmax(0, 240px);
  }

  &.count-2,
  &.count-4 {
    grid-template-columns: repeat(2, 120px);
  }

  &.count-3,
  &.count-5,
  &.count-6,
  &.count-7,
  &.count-8,
  &.count-9 {
    grid-template-columns: repeat(3, 100px);
  }
}

.circle-post-item-media-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #F0F2F5;
  cursor: pointer;
}

.circle-post-item-media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-post-item-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

.circle-post-item-action {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #636E72;
  font-size: 13px;
  cursor: pointer;

  img {
    width: 16px;
    height: 16px;
  }

  &.active {
    color: #FF7D45;
  }
}

.circle-post-item-comments {
  margin-top: 12px;
  padding: 10px 12px;
  background: #F7F8FA;
  border-radius: 6px;
}

.circle-post-item-comment {
  font-size: 13px;
  line-height: 1.6;
  color: #2D3436;
  cursor: pointer;

  & + & {
    margin-top: 4px;
  }
}

.circle-post-item-comment-name {
  color: #4A6FA1;
  font-weight: 500;
}
</style>
