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
  <div class="comment-section">
    <div v-if="comments && comments.length > 0" class="comments-list">
      <div
        v-for="commentGroup in groupedComments"
        :key="commentGroup.rootId"
        class="comment-group"
      >
        <div class="comment-item root-comment">
          <div class="comment-avatar">
            <BeaverImage class="user-avatar" :file-name="commentGroup.root.avatar" :cache-type="CacheType.USER_AVATAR" />
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-user">{{ commentGroup.root.userName }}</span>
            </div>
            <div class="comment-text">
              {{ commentGroup.root.content }}
            </div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatCommentTime(commentGroup.root.createdAt) }}</span>
              <span class="comment-separator">|</span>
              <button class="reply-btn" type="button" @click="$emit('reply', commentGroup.root)">
                回复
              </button>
            </div>
          </div>
        </div>

        <div v-if="commentGroup.replies && commentGroup.replies.length > 0" class="replies-section">
          <div
            v-for="reply in commentGroup.replies"
            :key="reply.commentId"
            class="comment-item reply-comment"
          >
            <div class="reply-top">
              <div class="comment-avatar">
                <BeaverImage class="user-avatar" :file-name="reply.avatar" :cache-type="CacheType.USER_AVATAR" />
              </div>
              <div class="comment-header">
                <span class="comment-user">{{ reply.userName }}</span>
                <span class="reply-indicator">回复</span>
                <span class="reply-target">{{ reply.replyToUserName || commentGroup.root.userName }}</span>
              </div>
            </div>
            <div class="comment-text">
              {{ reply.content }}
            </div>
            <div class="comment-footer">
              <span class="comment-time">{{ formatCommentTime(reply.createdAt) }}</span>
              <span class="comment-separator">|</span>
              <button class="reply-btn" type="button" @click="$emit('reply', reply)">
                回复
              </button>
            </div>
          </div>
          <div
            v-if="commentGroup.root.childCount > ((commentGroup.replies && commentGroup.replies.length) || 0)"
            class="replies-more"
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
import type { ICircleCommentItem } from 'commonModule/type/ajax/circle'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'CircleCommentSection',
  components: { BeaverImage },
  props: {
    comments: {
      type: Array as () => ICircleCommentItem[],
      default: () => [],
    },
  },
  emits: ['reply', 'loadMoreComments', 'loadMoreChildren'],
  setup(props) {
    const groupedComments = computed(() => {
      if (!props.comments?.length)
        return []

      const roots: Array<{ root: ICircleCommentItem, replies: ICircleCommentItem[] }> = []
      const rootMap = new Map<string, { root: ICircleCommentItem, replies: ICircleCommentItem[] }>()

      props.comments.forEach((comment) => {
        if (!comment.parentId) {
          const node = { root: comment, replies: [...(comment.children || [])] }
          roots.push(node)
          rootMap.set(comment.commentId, node)
        }
      })

      props.comments.forEach((comment) => {
        if (comment.parentId && rootMap.has(comment.parentId)) {
          const node = rootMap.get(comment.parentId)!
          if (!node.replies.some(item => item.commentId === comment.commentId))
            node.replies.push(comment)
        }
      })

      return roots.map(item => ({
        rootId: item.root.commentId,
        ...item,
      }))
    })

    const formatCommentTime = (timeStr: string) => {
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

    return {
      CacheType,
      groupedComments,
      formatCommentTime,
    }
  },
})
</script>

<style lang="less" scoped>
.comment-section {
  padding: 16px 0;

  .comments-list {
    .comment-group {
      margin-bottom: 20px;

      .comment-item {
        display: flex;
        gap: 12px;

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
              padding: 2px 0;
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
