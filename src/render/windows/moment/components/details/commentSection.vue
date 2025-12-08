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
            <BeaverImage class="user-avatar" :file-name="getAvatar(commentGroup.root)" :cache-type="CacheType.USER_AVATAR" />
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-user">{{ getName(commentGroup.root) }}</span>
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
            <div class="reply-top">
              <div class="comment-avatar">
                <BeaverImage class="user-avatar" :file-name="getAvatar(reply)" :cache-type="CacheType.USER_AVATAR" />
              </div>
              <div class="comment-header">
                <span class="comment-user">{{ getName(reply) }}</span>
                <span class="reply-indicator">回复</span>
                <span class="reply-target">{{ reply.replyToUserName || getName(commentGroup.root) }}</span>
              </div>
            </div>
            <div class="comment-text">{{ reply.content }}</div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatCommentTime(reply.createdAt) }}</span>
              <span class="comment-separator">|</span>
              <button class="reply-btn" @click="$emit('reply', reply)">回复</button>
            </div>
          </div>
          <div
            class="replies-more"
            v-if="commentGroup.root.childCount > ((commentGroup.replies && commentGroup.replies.length) || 0)"
            @click="$emit('loadMoreChildren', commentGroup.root)"
          >
            共 {{ commentGroup.root.childCount }} 条回复
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
import { useUserStore } from 'renderModule/windows/moment/store/user/user'

export default defineComponent({
  name: 'CommentSection',
  components: {
    BeaverImage,
  },
  props: {
    comments: {
      type: Array,
      default: () => []
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['reply', 'loadMoreComments', 'loadMoreChildren'],
  setup(props) {
    const userStore = useUserStore()

    // 获取分组后的评论（按根节点分组，两层）
    const groupedComments = computed(() => {
      if (!props.comments || !Array.isArray(props.comments)) return []

      const roots: any[] = []
      const rootMap = new Map<string, any>()

      // 收集顶层
      props.comments.forEach((comment: any) => {
        const isRoot = !comment.parentId
        if (isRoot) {
          const node = { root: comment, replies: comment.children || [] }
          roots.push(node)
          rootMap.set(comment.id, node)
        }
      })

      // 补充没有 children 的情况
      props.comments.forEach((comment: any) => {
        if (comment.parentId && rootMap.has(comment.parentId)) {
          const node = rootMap.get(comment.parentId)
          node.replies = node.replies || []
          node.replies.push(comment)
        }
      })

      return roots.map((item) => ({
        rootId: item.root.id,
        ...item
      }))
    })

    const getName = (c: any) => {
      const info = userStore.getContact(c.userId || '')
      return info.nickName || c.userName || c.nickName
    }
    const getAvatar = (c: any) => {
      const info = userStore.getContact(c.userId || '')
      return info.avatar || c.avatar
    }

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
      getName,
      getAvatar,
    }
  }
})
</script>

<style lang="less" scoped>
.comment-section {
  padding: 16px 0;

  .comments-list {
    .comment-group {
      margin-bottom: 20px;

      &:last-child {
      }

      .comment-item {
        display: flex;
        gap: 12px;

        &.root-comment {
          // padding: 12px 0;
        }

        &.reply-comment {
          flex-direction: column;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;

          .reply-top {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            .comment-header {
              .reply-indicator {
                margin: 0 10px;
                color: #999999;
              }
            }
            .comment-avatar {
              .user-avatar {
                width: 24px;
                height: 24px;
              }
              
            }
          }
          .comment-text {
            font-size: 15px;
          }
          .comment-footer {
            font-size: 11px;
            color: #999999;

            .comment-separator {
              margin: 0 5px;
            }
            .reply-btn {
              background: none;
              border: none;
              color: #666666;
              font-size: 11px;
              cursor: pointer;
              padding: 2px 0px;
              border-radius: 4px;
              transition: background-color 0.2s ease;

            }
          }

        }

        .comment-avatar {
          flex-shrink: 0;

          .user-avatar {
            width: 36px;
            height: 36px;
            
            border-radius: 100%;
          }
        }

        .comment-content {
          flex: 1;
          min-width: 0;

          .comment-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;

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
          }
        }
      }

      .replies-section {
        margin-top: 8px;
        background: #F8F9FA;
        margin-left: 38px;
        border-radius: 10px;

      }

      .comment-more {
        font-size: 12px;
        color: #999999;
        cursor: pointer;
        padding-left: 12px;

        &:hover {
          color: #FF7D45;
        }
      }

      .replies-more {
        font-size: 12px;
        color: #4678be;
        cursor: pointer;
        margin-left: 12px;
        padding-bottom: 10px;

        &:hover {
          color: #FF7D45;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #999999;
    font-size: 14px;
  }
}
</style>
