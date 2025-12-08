<template>
  <div class="moment-detail-overlay" @click="handleOverlayClick">
    <div class="moment-detail-panel" @click.stop>
      <!-- Header -->
      <div class="detail-header">
        <span class="header-title">海狸朋友圈</span>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <!-- 主内容区域（可滚动） -->
      <div class="main-content" ref="mainContentRef">
        <!-- 朋友圈内容 -->
        <MomentContentCard
          :user-name="displayUserName"
          :nick-name="displayUserName"
          :avatar="displayAvatar"
          :created-at="moment.createdAt"
          :content="moment.content"
          :files="moment.files"
          @media-click="handleMediaClick"
        />

        <!-- 评论和点赞区域 -->
        <div class="interaction-section">
          <!-- 标签页切换 -->
          <div class="tab-bar">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'comments' }"
              @click="activeTab = 'comments'"
            >
              评论 {{ moment.commentCount ?? (moment.comments?.length || 0) }}
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'likes' }"
              @click="activeTab = 'likes'"
            >
              点赞 {{ moment.likes?.length || 0 }}
            </div>
            <div class="placeholder"></div>
            <div class="tab-actions">
              <button class="refresh-btn" @click="handleRefresh">
                <img src="renderModule/assets/image/moment/refresh.svg" alt="刷新" class="refresh-icon">
              </button>
            </div>
          </div>

          <!-- 标签页内容 -->
          <div class="tab-content">
            <!-- 评论内容 -->
            <CommentSection
              v-if="activeTab === 'comments'"
              :comments="moment.comments"
              :comment-count="moment.commentCount ?? (moment.comments?.length || 0)"
              @reply="handleReply"
              @load-more-comments="handleLoadMoreComments"
              @load-more-children="handleLoadMoreChildren"
            />

            <!-- 点赞内容 -->
            <LikeSection
              v-else
              :likes="moment.likes"
            />
          </div>
        </div>
      </div>

      <!-- 底部固定输入区域 -->
      <BottomInputSection
        :is-liked="moment.isLiked"
        :reply-placeholder="replyTarget ? `回复 ${replyTarget.userName || replyTarget.nickName || ''}` : '说点什么...'"
        :open-key="openKey"
        @send-comment="handleSendComment"
        @quick-like="handleQuickLike"
        @close-reply="replyTarget = null"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { IMomentInfo } from 'commonModule/type/ajax/moment'
import CommentSection from './commentSection.vue'
import LikeSection from './likeSection.vue'
import BottomInputSection from './bottomInputSection.vue'
import { useMomentStore } from '../../store/moment/moment'
import { useUserStore } from '../../store/user/user'
import MomentContentCard from '../common/MomentContentCard.vue'


export default defineComponent({
  name: 'MomentDetail',
  components: {
    CommentSection,
    LikeSection,
    MomentContentCard,
    BottomInputSection,
  },
  emits: ['close'],
  setup(props, { emit }) {
    const momentStore = useMomentStore()
    const userStore = useUserStore()

    // 获取当前选中的moment
    const moment = computed(() => momentStore.getCurrentMoment() || {} as IMomentInfo)

    const displayUserName = computed(() => {
      if (!moment.value) return ''
      const info = userStore.getContact(moment.value.userId || '')
      return info.nickName || moment.value.userName || (moment.value as any).nickName || ''
    })
    const displayAvatar = computed(() => {
      if (!moment.value) return ''
      const info = userStore.getContact(moment.value.userId || '')
      return info.avatar || moment.value.avatar || ''
    })

    // 标签页状态
    const activeTab = ref('comments')
    const replyTarget = ref<any | null>(null)
    const openKey = ref(0)
    const commentPage = ref(1)
    const commentLimit = 20
    const childLimit = 20
    const childPageMap = ref<Record<string, number>>({})
    const isLoadingComments = ref(false)
    const mainContentRef = ref<HTMLElement | null>(null)

    const resetChildPages = () => {
      childPageMap.value = {}
    }

    // 处理关闭
    const handleClose = () => {
      emit('close')
    }


    const handleRefresh = async () => {
      if (moment.value.id) {
        commentPage.value = 1
        resetChildPages()
        await Promise.all([
          momentStore.loadMomentDetail(moment.value.id),
          momentStore.refreshComments(moment.value.id, 1, commentLimit),
          momentStore.refreshLikes(moment.value.id, 1, 50),
        ])
      }
    }

    // 处理快速点赞
    const handleQuickLike = async () => {
      if (moment.value.id) {
        await momentStore.toggleLike(moment.value.id, 'like')
      }
    }


    // 处理点击遮罩层
    const handleOverlayClick = () => {
      // 直接关闭详情页面
      emit('close')
    }


    // 处理发送评论
    const handleSendComment = async (commentText: string) => {
      if (moment.value.id) {
        const currentReplyTarget = replyTarget.value
        await momentStore.addComment(moment.value.id, commentText, currentReplyTarget || undefined)
        replyTarget.value = null
        // 顶层/子评论均只做本地追加，不再额外拉取评论接口，避免列表错乱
      }
    }

    // 处理回复
    const handleReply = (targetComment: any) => {
      replyTarget.value = targetComment
      openKey.value += 1 // 触发底部输入框打开
    }

    const hasMoreComments = computed(() => {
      const total = moment.value.commentCount || 0
      const loaded = moment.value.comments?.length || 0
      return loaded < total
    })

    // 加载更多顶层评论（自动触发）
    const handleLoadMoreComments = async () => {
      if (!moment.value.id || !hasMoreComments.value || isLoadingComments.value) return
      isLoadingComments.value = true
      commentPage.value += 1
      await momentStore.loadMoreComments(moment.value.id, commentPage.value, commentLimit)
      isLoadingComments.value = false
    }

    // 加载更多子回复（分页，不合并到其他 root）
    const handleLoadMoreChildren = async (root: any) => {
      if (moment.value.id) {
        const current = childPageMap.value[root.id] || 0
        const nextPage = current + 1
        await momentStore.loadChildComments(moment.value.id, root.id, nextPage, childLimit)
        childPageMap.value = {
          ...childPageMap.value,
          [root.id]: nextPage,
        }
      }
    }

    // 处理媒体文件点击
    const handleMediaClick = (file: any, files: any[]) => {
      // TODO: 打开媒体查看器
      console.log('查看媒体文件:', file, files)
    }

    // 获取文件名
    const getFileName = (fileName: string) => {
      return fileName.split('/').pop() || '未知文件'
    }

    // 首次打开加载详情、评论、点赞
    watch(
      () => moment.value.id,
      async (id) => {
        if (id) {
          resetChildPages()
          await Promise.all([
            momentStore.loadMomentDetail(id),
            momentStore.refreshComments(id, 1, commentLimit),
            momentStore.refreshLikes(id, 1, 50),
          ])
        }
      },
      { immediate: true }
    )

    // 评论区域滚动自动加载更多
    const onScroll = () => {
      if (activeTab.value !== 'comments') return
      const el = mainContentRef.value
      if (!el) return
      const threshold = 120
      if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
        handleLoadMoreComments()
      }
    }

    onMounted(() => {
      mainContentRef.value?.addEventListener('scroll', onScroll, { passive: true })
    })

    onUnmounted(() => {
      mainContentRef.value?.removeEventListener('scroll', onScroll)
    })

    return {
      moment,
      activeTab,
      replyTarget,
      openKey,
      commentPage,
      mainContentRef,
      handleClose,
      handleOverlayClick,
      handleRefresh,
      handleQuickLike,
      handleSendComment,
      handleReply,
      handleLoadMoreComments,
      handleLoadMoreChildren,
      handleMediaClick,
      getFileName,
      displayUserName,
      displayAvatar,
    }
  }
})
</script>

<style lang="less" scoped>
.moment-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.moment-detail-panel {
  background: #FFFFFF;
  width: 450px;
  height: 100vh;
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
  .moment-content-card {
    padding: 0 20px;
  }
  /* 现代化滚动条样式 */
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
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(180deg, #E86835 0%, #D55A2B 100%);
      box-shadow: 0 0 6px rgba(255, 125, 69, 0.4);
    }
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

.bottom-input-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  padding: 0;
  z-index: 10;
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

/* 标签页切换 */
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
  padding: 16px 0;
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
  transition: background-color 0.2s ease;

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

/* 朋友圈内容样式 */
.moment-item {
  padding: 0;
}

.moment-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}

.moment-time {
  font-size: 12px;
  color: #999999;
}

.moment-content-section {
  margin-bottom: 12px;
}

.moment-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333333;
  margin-bottom: 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 媒体文件样式 */
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

  &.has-more {
    cursor: default;
  }

  &:hover {
    opacity: 0.9;
  }
}

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

/* 点赞区域 */
.likes-section {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  background-color: #F8F8F8;
  border-radius: 6px;
  margin-bottom: 12px;
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


/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999999;
  font-size: 14px;
}


</style>
