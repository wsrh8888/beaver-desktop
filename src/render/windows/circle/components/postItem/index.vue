<template>
  <div class="circle-post-item">
    <div class="circle-post-item-head">
      <div class="circle-post-item-avatar">
        <span>{{ post.userName.slice(0, 1) }}</span>
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

    <div v-if="post.title" class="circle-post-item-title">
      {{ post.title }}
    </div>
    <div class="circle-post-item-content">
      {{ post.content }}
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
      <div class="circle-post-item-action readonly">
        <img src="renderModule/assets/image/moment/comment.svg" alt="评论">
        <span>{{ post.commentCount || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ICirclePostItem } from 'commonModule/type/ajax/circle'
import { defineComponent } from 'vue'
import likeIcon from 'renderModule/assets/image/moment/like-default.svg'
import likeActiveIcon from 'renderModule/assets/image/moment/like-active.svg'

export default defineComponent({
  name: 'CirclePostItem',
  props: {
    post: {
      type: Object as () => ICirclePostItem,
      required: true,
    },
  },
  emits: ['like'],
  setup() {
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

    return {
      likeIcon,
      likeActiveIcon,
      formatTime,
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
  background: #D9E6FF;
  color: #4A6FA1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
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

.circle-post-item-title {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #2D3436;
}

.circle-post-item-content {
  font-size: 14px;
  line-height: 1.6;
  color: #2D3436;
  white-space: pre-wrap;
  word-break: break-word;
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

  &.readonly {
    cursor: default;
  }
}
</style>
