<template>
  <div class="moment-detail-overlay" @click="handleOverlayClick">
    <div class="moment-detail-panel" @click.stop>
      <!-- Header -->
      <div class="detail-header">
        <span class="header-title">海狸朋友圈</span>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <!-- 主内容区域（可滚动） -->
      <div class="main-content">
        <!-- 朋友圈内容 -->
        <MomentContentCard
          :user-name="moment.userName"
          :nick-name="moment.nickName"
          :avatar="moment.avatar"
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
              评论 {{ moment.comments?.length || 0 }}
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
              @reply="handleReply"
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
        @send-comment="handleSendComment"
        @quick-like="handleQuickLike"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import type { IMomentInfo } from 'commonModule/type/ajax/moment'
import MomentContentCard from '../common/momentContentCard.vue'
import CommentSection from './commentSection.vue'
import LikeSection from './likeSection.vue'
import BottomInputSection from './bottomInputSection.vue'
import { useMomentStore } from '../../store/moment/moment'

export default defineComponent({
  name: 'MomentDetail',
  components: {
    MomentContentCard,
    CommentSection,
    LikeSection,
    BottomInputSection,
  },
  emits: ['close'],
  setup(props, { emit }) {
    const momentStore = useMomentStore()

    // 当前用户信息
    const currentUser = ref({
      userId: '100000',
      userName: '我',
      nickName: '我',
      avatar: 'renderModule/assets/image/common/default-avatar.svg'
    })

    // 获取当前选中的moment
    const moment = computed(() => momentStore.getCurrentMoment() || {} as IMomentInfo)

    // 标签页状态
    const activeTab = ref('comments')



    // 处理关闭
    const handleClose = () => {
      emit('close')
    }


    // 处理刷新
    const handleRefresh = () => {
      // TODO: 刷新评论和点赞数据
      console.log('刷新数据')
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
    const handleSendComment = (commentText: string) => {
      // TODO: 发送评论逻辑
      console.log('发送评论:', commentText)
    }

    // 处理回复
    const handleReply = (targetComment: any) => {
      // TODO: 设置回复目标
      console.log('回复评论:', targetComment)
      // 这里可以直接调用子组件的方法，但现在先通过其他方式处理
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

    return {
      moment,
      currentUser,
      activeTab,
      handleClose,
      handleOverlayClick,
      handleRefresh,
      handleQuickLike,
      handleSendComment,
      handleReply,
      handleMediaClick,
      getFileName,
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
  padding: 20px 0;
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
