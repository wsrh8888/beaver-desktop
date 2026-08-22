<template>
  <div class="moment-detail-overlay" @click="handleOverlayClick">
    <div class="moment-detail-panel" @click.stop>
      <div class="detail-header">
        <span class="header-title">帖子详情</span>
        <button class="close-btn" type="button" @click="handleClose">
          ×
        </button>
      </div>

      <div ref="mainContentRef" class="main-content">
        <MomentContentCard
          :user-name="detail.userName"
          :nick-name="detail.userName"
          :avatar="detail.avatar"
          :created-at="detail.createdAt"
          :content="detail.content"
          :files="detail.files"
        />

        <div class="interaction-section">
          <div class="tab-bar">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'comments' }"
              @click="activeTab = 'comments'"
            >
              评论 {{ detail.commentCount || 0 }}
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'likes' }"
              @click="activeTab = 'likes'"
            >
              点赞 {{ detail.likeCount || 0 }}
            </div>
            <div class="placeholder" />
            <div class="tab-actions">
              <button class="refresh-btn" type="button" @click="handleRefresh">
                <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="refresh-icon">
              </button>
            </div>
          </div>

          <div class="tab-content">
            <CommentSection
              v-if="activeTab === 'comments'"
              :comments="comments"
              @reply="handleReply"
              @load-more-children="handleLoadMoreChildren"
            />
            <LikeSection
              v-else
              :likes="likes"
            />
          </div>
        </div>
      </div>

      <BottomInputSection
        ref="bottomInputRef"
        :is-liked="detail.isLiked"
        :reply-placeholder="replyTarget ? `回复 ${replyTarget.userName || ''}` : '说点什么...'"
        @send-comment="handleSendComment"
        @quick-like="handleQuickLike"
        @close-reply="replyTarget = null"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { ICircleCommentItem, ICirclePostItem, ICirclePostLikeItem, IGetPostDetailRes } from 'commonModule/type/ajax/circle'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import {
  createCommentApi,
  getCommentListApi,
  getPostDetailApi,
  getPostLikesApi,
  likePostApi,
} from 'renderModule/api/circle'
import Message from 'renderModule/components/ui/message'
import MomentContentCard from 'renderModule/windows/moment/components/common/MomentContentCard.vue'
import BottomInputSection from './bottomInputSection.vue'
import CommentSection from './commentSection.vue'
import LikeSection from './likeSection.vue'

export default defineComponent({
  name: 'CirclePostDetail',
  components: {
    MomentContentCard,
    CommentSection,
    LikeSection,
    BottomInputSection,
  },
  props: {
    post: {
      type: Object as () => ICirclePostItem,
      required: true,
    },
  },
  emits: ['close', 'commented', 'liked'],
  setup(props, { emit }) {
    const activeTab = ref('comments')
    const replyTarget = ref<ICircleCommentItem | null>(null)
    const comments = ref<ICircleCommentItem[]>([])
    const likes = ref<ICirclePostLikeItem[]>([])
    const commentPage = ref(1)
    const commentLimit = 20
    const childLimit = 20
    const isLoadingComments = ref(false)
    const mainContentRef = ref<HTMLElement | null>(null)
    const bottomInputRef = ref<{ openFullInput: () => void } | null>(null)

    const detail = ref<IGetPostDetailRes>({
      postId: props.post.postId,
      circleId: props.post.circleId,
      userId: props.post.userId,
      userName: props.post.userName,
      avatar: props.post.avatar,
      content: props.post.content,
      files: props.post.files || [],
      commentCount: props.post.commentCount || 0,
      likeCount: props.post.likeCount || 0,
      isLiked: props.post.isLiked || false,
      comments: [],
      likes: [],
      createdAt: props.post.createdAt,
    })

    const hasMoreComments = computed(() => {
      const loaded = comments.value.filter(item => !item.parentId).length
      return loaded < (detail.value.commentCount || 0)
    })

    const loadDetail = async () => {
      const res = await getPostDetailApi({ postId: props.post.postId })
      if (res.code !== 0 || !res.result) {
        Message.error(res.msg || '获取帖子详情失败')
        return
      }
      detail.value = {
        ...res.result,
        files: res.result.files || [],
        comments: comments.value,
        likes: likes.value,
      }
    }

    const loadComments = async (page = 1, append = false) => {
      const res = await getCommentListApi({
        postId: props.post.postId,
        page,
        limit: commentLimit,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '获取评论失败')
        return
      }
      const list = res.result.list || []
      comments.value = append ? [...comments.value, ...list] : list
      if (typeof res.result.count === 'number')
        detail.value.commentCount = res.result.count
    }

    const loadLikes = async (page = 1, limit = 50) => {
      const res = await getPostLikesApi({
        postId: props.post.postId,
        page,
        limit,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '获取点赞失败')
        return
      }
      likes.value = res.result.list || []
      if (typeof res.result.count === 'number')
        detail.value.likeCount = res.result.count
    }

    const loadAll = async () => {
      await Promise.all([
        loadDetail(),
        loadComments(1, false),
        loadLikes(1, 50),
      ])
    }

    const handleRefresh = async () => {
      commentPage.value = 1
      await loadAll()
    }

    const handleClose = () => emit('close')
    const handleOverlayClick = () => emit('close')

    const handleReply = (target: ICircleCommentItem) => {
      replyTarget.value = target
      bottomInputRef.value?.openFullInput()
    }

    const handleQuickLike = async () => {
      const next = !detail.value.isLiked
      const res = await likePostApi({ postId: props.post.postId, status: next })
      if (res.code !== 0) {
        Message.error(res.msg || '操作失败')
        return
      }
      detail.value.isLiked = next
      detail.value.likeCount = Math.max(0, (detail.value.likeCount || 0) + (next ? 1 : -1))
      await Promise.all([loadDetail(), loadLikes(1, 50)])
      emit('liked')
    }

    const handleSendComment = async (commentText: string) => {
      const parentId = replyTarget.value
        ? (replyTarget.value.parentId || replyTarget.value.commentId)
        : ''
      const replyToCommentId = replyTarget.value?.commentId || ''
      const res = await createCommentApi({
        postId: props.post.postId,
        content: commentText,
        parentId: parentId || undefined,
        replyToCommentId: replyToCommentId || undefined,
      })
      if (res.code !== 0) {
        Message.error(res.msg || '评论失败')
        return
      }
      replyTarget.value = null
      commentPage.value = 1
      await loadComments(1, false)
      detail.value.commentCount = (detail.value.commentCount || 0) + 1
      emit('commented')
    }

    const handleLoadMoreComments = async () => {
      if (!hasMoreComments.value || isLoadingComments.value)
        return
      isLoadingComments.value = true
      commentPage.value += 1
      await loadComments(commentPage.value, true)
      isLoadingComments.value = false
    }

    const handleLoadMoreChildren = async (root: ICircleCommentItem) => {
      const res = await getCommentListApi({
        postId: props.post.postId,
        parentId: root.commentId,
        page: 1,
        limit: childLimit,
      })
      if (res.code !== 0)
        return
      const children = res.result.list || []
      const idx = comments.value.findIndex(item => item.commentId === root.commentId)
      if (idx >= 0) {
        comments.value[idx] = {
          ...comments.value[idx],
          children,
          childCount: res.result.count || children.length,
        }
      }
    }

    const onScroll = () => {
      if (activeTab.value !== 'comments')
        return
      const el = mainContentRef.value
      if (!el)
        return
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 120)
        handleLoadMoreComments()
    }

    onMounted(async () => {
      mainContentRef.value?.addEventListener('scroll', onScroll, { passive: true })
      await loadAll()
    })

    onUnmounted(() => {
      mainContentRef.value?.removeEventListener('scroll', onScroll)
    })

    return {
      detail,
      comments,
      likes,
      activeTab,
      replyTarget,
      mainContentRef,
      bottomInputRef,
      handleClose,
      handleOverlayClick,
      handleRefresh,
      handleReply,
      handleQuickLike,
      handleSendComment,
      handleLoadMoreChildren,
    }
  },
})
</script>

<style lang="less" scoped>
.moment-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.moment-detail-panel {
  background: #FFFFFF;
  width: 450px;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  animation: slideRight 0.3s ease-out;
  position: relative;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 120px;

  :deep(.moment-content-card) {
    padding: 0 20px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #FF7D45 0%, #E86835 100%);
    border-radius: 3px;
  }
}

@keyframes slideRight {
  from {
    transform: translateX(100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 16px;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background-color: #F5F5F5;
  }
}

.tab-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E5E5E5;
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 0 10px;

  .tab-item {
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #666666;
    cursor: pointer;
    transition: color 0.2s ease;
    position: relative;
    padding: 16px 10px;

    &.active {
      color: #FF7D45;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 2px;
        background: #FF7D45;
        border-radius: 1px;
      }
    }

    &:hover {
      color: #FF7D45;
    }
  }

  .placeholder {
    flex: 1;
  }
}

.tab-actions {
  padding: 0 16px;
}

.refresh-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    background: #F5F5F5;
  }

  .refresh-icon {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}
</style>
