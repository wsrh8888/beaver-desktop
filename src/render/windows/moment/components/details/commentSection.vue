<template>
  <div class="comment-section">
    <div class="comments-list" v-if="comments && comments.length > 0">
      <!-- 这里需要重新组织评论数据，按根节点分组 -->
      <div
        v-for="commentGroup in groupedComments"
        :key="commentGroup.rootId"
        class="comment-group"
      >
        <!-- 根评论 -->
        <div class="comment-item root-comment">
          <div class="comment-avatar">
            <BeaverImage :file-name="commentGroup.root.avatar" :cache-type="CacheType.USER_AVATAR" />
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-user">{{ commentGroup.root.userName || commentGroup.root.nickName }}</span>
            </div>
            <div class="comment-text">{{ commentGroup.root.content }}</div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatCommentTime(commentGroup.root.createdAt) }}</span>
              <span class="comment-separator">|</span>
              <button class="reply-btn" @click="$emit('reply', commentGroup.root)">回复</button>
            </div>
          </div>
        </div>

        <!-- 回复列表 -->
        <div v-if="commentGroup.replies && commentGroup.replies.length > 0" class="replies-section">
          <div
            v-for="reply in commentGroup.replies"
            :key="reply.id"
            class="comment-item reply-comment"
          >
            <div class="comment-avatar">
              <BeaverImage :file-name="reply.avatar" :cache-type="CacheType.USER_AVATAR" />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-user">{{ reply.userName || reply.nickName }}</span>
                <span class="reply-indicator">回复</span>
                <span class="reply-target">{{ commentGroup.root.userName || commentGroup.root.nickName }}</span>
              </div>
              <div class="comment-text">{{ reply.content }}</div>
              <div class="comment-footer">
                <span class="comment-time">{{ formatCommentTime(reply.createdAt) }}</span>
                <span class="comment-separator">|</span>
                <button class="reply-btn" @click="$emit('reply', reply)">回复</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <span>暂无评论</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { CacheType } from 'commonModule/type/cache/cache'

export default defineComponent({
  name: 'CommentSection',
  components: {
    BeaverImage,
  },
  props: {
    comments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['reply'],
  setup(props) {
    // 获取分组后的评论（按根节点分组）
    const groupedComments = computed(() => {
      if (!props.comments || !Array.isArray(props.comments)) return []

      const groups: any[] = []
      const commentMap = new Map()

      // 先找出所有根评论（没有replyTo的评论）
      props.comments.forEach((comment: any) => {
        if (!comment.replyTo) {
          commentMap.set(comment.id, {
            root: comment,
            replies: []
          })
        }
      })

      // 将回复分配到对应的根评论下
      props.comments.forEach((comment: any) => {
        if (comment.replyTo) {
          // 这里需要找到根评论的ID，暂时简化处理
          const rootId = comment.replyTo.id // 假设replyTo直接指向根评论
          if (commentMap.has(rootId)) {
            commentMap.get(rootId).replies.push(comment)
          }
        }
      })

      // 转换为数组
      commentMap.forEach((group, rootId) => {
        groups.push({
          rootId,
          ...group
        })
      })

      return groups
    })

    // 格式化评论时间
    const formatCommentTime = (timeStr: string) => {
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
      groupedComments,
      formatCommentTime,
      CacheType,
    }
  }
})
</script>

<style lang="less" scoped>
.comment-section {
  padding: 16px 0;
}

.comment-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  &.root-comment {
    padding: 12px;
    background: #F8F9FA;
    border-radius: 8px;
  }

  &.reply-comment {
    margin-left: 44px;
    padding: 8px 12px;
    background: #F8F9FA;
    border-radius: 8px;
    border-left: 2px solid #E9ECEF;
  }
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-avatar .user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 6px;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.comment-user {
  font-size: 14px;
  font-weight: 500;
  color: #576B95;
}

.reply-indicator {
  font-size: 12px;
  color: #666666;
}

.reply-target {
  font-size: 12px;
  font-weight: 500;
  color: #576B95;
}

.comment-text {
  font-size: 14px;
  color: #333333;
  line-height: 1.5;
  word-wrap: break-word;
  margin-bottom: 6px;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-time {
  font-size: 12px;
  color: #999999;
}

.comment-separator {
  color: #CCCCCC;
}

.reply-btn {
  background: none;
  border: none;
  color: #666666;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #E9ECEF;
    color: #FF7D45;
  }
}

.replies-section {
  margin-top: 8px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999999;
  font-size: 14px;
}
</style>
