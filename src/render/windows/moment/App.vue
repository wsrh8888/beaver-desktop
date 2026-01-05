<template>
  <div class="moment__content">
    <!-- 标题栏 -->
    <MomentHeader />

    <!-- 主要内容区域 -->
    <MomentContent />

    <!-- 发布按钮 -->
    <button class="publish-float-btn" @click="handlePublish">
      <img src="renderModule/assets/image/moment/publish.svg" alt="发布" class="publish-icon">
    </button>

    <!-- 发布弹窗 -->
    <MomentCreate
      v-if="showPublishModal"
      @close="showPublishModal = false"
    />

    <!-- 详情弹窗 -->
    <MomentDetail
      v-if="momentStore.currentMomentId"
      @close="momentStore.hideMomentDetail()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import MomentContent from './components/content/index.vue'
import MomentCreate from './components/create/index.vue'

import MomentDetail from './components/details/index.vue'
import MomentHeader from './components/header/index.vue'
import { useMomentStore } from './store/moment/moment'
import { useUserStore } from './store/user/user'
import notificationManager from './notification-manager'

export default defineComponent({
  components: {
    MomentHeader,
    MomentContent,
    MomentCreate,
    MomentDetail,
  },
  setup() {
    const showPublishModal = ref(false)
    const momentStore = useMomentStore()
    const userStore = useUserStore()

    const handlePublish = () => {
      showPublishModal.value = true
    }

    onMounted(() => {
      userStore.init()
      notificationManager.init()
    })

    onUnmounted(() => {
      notificationManager.off()
    })

    return {
      showPublishModal,
      momentStore,
      handlePublish,
    }
  },
})
</script>

<style lang="less" scoped>
.moment__content {
  width: 100%;
  height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 标题栏 */
.titlebar {
  height: 40px;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag;
  flex-shrink: 0;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
    -webkit-app-region: drag;

    .title-icon {
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }

    span {
      -webkit-app-region: drag;
    }
  }

  .title-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    -webkit-app-region: no-drag;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #F9FAFB;
    }

    &.refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-icon {
      width: 16px;
      height: 16px;
      opacity: 0.7;
      transition: opacity 0.2s ease;

      &.refreshing {
        animation: spin 1s linear infinite;
      }
    }

    &:hover .action-icon {
      opacity: 1;
    }
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    -webkit-app-region: no-drag;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #FFE6E6;

      img {
        opacity: 1;
        filter: brightness(0) saturate(100%) invert(19%) sepia(94%) saturate(7450%) hue-rotate(357deg) brightness(97%) contrast(108%);
      }
    }

    img {
      width: 14px;
      height: 14px;
      opacity: 0.7;
      transition: all 0.2s ease;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 主要内容区域 */
.moment__main {
  flex: 1;
  overflow: hidden;
  -webkit-app-region: no-drag;
  display: flex;
  flex-direction: column;
}

/* 动态列表区域 */
.moments-section {
  flex: 1;
  overflow-y: auto;
  background: #FFFFFF;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F9FAFB;
  }

  &::-webkit-scrollbar-thumb {
    background: #B2BEC3;
    border-radius: 3px;

    &:hover {
      background: #636E72;
    }
  }
}

.moments-list {
  padding: 16px;
}

/* 状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EBEEF5;
  border-top: 3px solid #FF7D45;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #636E72;
}

/* 主容器 */
.moment-container {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #FFE6D9 0%, #FFF6F2 50%, #FFFFFF 100%);
  overflow: hidden;
}

/* 渐变背景 */
.moment-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(255, 125, 69, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(74, 111, 161, 0.08) 0%, transparent 50%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image:
    radial-gradient(circle at 25% 25%, #FF7D45 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, #4A6FA1 1px, transparent 1px);
  background-size: 40px 40px, 60px 60px;
  background-position: 0 0, 20px 20px;
}

/* 主内容卡片 */
.moment-card {
  width: 100%;
  max-width: 480px;
  height: 100%;
  max-height: 720px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.title-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 125, 69, 0.3);

  img {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }
}

.title-text {
  h1 {
    font-size: 18px;
    font-weight: 600;
    color: #2D3436;
    margin: 0 0 2px 0;
    line-height: 1.2;
  }

  p {
    font-size: 12px;
    color: #B2BEC3;
    margin: 0;
    line-height: 1.2;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(255, 125, 69, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 125, 69, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &:hover {
      background: transparent;
      box-shadow: none;
    }
  }

  .action-icon {
    width: 18px;
    height: 18px;
    opacity: 0.7;
    transition: all 0.2s ease;

    &.refreshing {
      animation: spin 1s linear infinite;
    }
  }

  &:hover .action-icon {
    opacity: 1;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 内容区域 */
.moment-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(178, 190, 195, 0.3);
    border-radius: 2px;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(178, 190, 195, 0.6);
    }
  }
}

/* 发布引导卡片 */
.publish-card {
  margin: 16px 24px 0;
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
  border: 1px solid rgba(235, 238, 245, 0.8);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 125, 69, 0.15);
    border-color: rgba(255, 125, 69, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.publish-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.publish-placeholder {
  flex: 1;

  span {
    color: #B2BEC3;
    font-size: 14px;
    font-style: italic;
  }
}

.publish-actions {
  flex-shrink: 0;
}

.media-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 125, 69, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 125, 69, 0.2);
    transform: scale(1.05);
  }

  img {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
}

/* 动态列表 */
.moments-list {
  padding: 16px 24px 24px;
}

/* 状态卡片 */
.loading-card,
.empty-card,
.load-more-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  margin: 20px 0;
}

.loading-card {
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #EBEEF5;
    border-top: 3px solid #FF7D45;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  .loading-text {
    font-size: 14px;
    color: #636E72;
  }
}

.empty-card {
  .empty-illustration {
    position: relative;
    margin-bottom: 24px;
  }

  .illustration-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(255, 125, 69, 0.3);
    position: relative;
    z-index: 2;

    img {
      width: 32px;
      height: 32px;
      filter: brightness(0) invert(1);
    }
  }

  .illustration-sparkles {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    pointer-events: none;

    .sparkle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #FFD166;
      border-radius: 50%;
      animation: sparkle 2s ease-in-out infinite;

      &:nth-child(1) {
        top: 10px;
        left: 20px;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 20px;
        right: 15px;
        animation-delay: 0.5s;
      }

      &:nth-child(3) {
        top: 25px;
        left: 35px;
        animation-delay: 1s;
      }
    }
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #2D3436;
    margin: 0 0 8px 0;
  }

  .empty-description {
    font-size: 14px;
    color: #636E72;
    margin: 0 0 24px 0;
    line-height: 1.5;
    max-width: 280px;
  }

  .empty-action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(255, 125, 69, 0.3);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(255, 125, 69, 0.4);
    }

    &:active {
      transform: translateY(0);
    }

    img {
      width: 16px;
      height: 16px;
    }
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.load-more-card {
  .load-more-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
  }

  .indicator-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #EBEEF5 50%, transparent 100%);
  }

  .indicator-text {
    font-size: 12px;
    color: #B2BEC3;
    white-space: nowrap;
  }
}

.moment__content {
  width: 100%;
  height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: drag;
}

/* 标题栏 */
.titlebar {
  height: 40px;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #EBEEF5;
  -webkit-app-region: drag;
  flex-shrink: 0;

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #2D3748;
    -webkit-app-region: drag;
  }

  .title-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .publish-btn,
  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    -webkit-app-region: no-drag;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #F9FAFB;
    }

    img {
      width: 16px;
      height: 16px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    &:hover img {
      opacity: 1;
    }
  }

  .close-btn {
    width: 16px;
    height: 16px;

    img {
      width: 16px;
      height: 16px;
    }
  }
}

/* 主要内容区域 - 单列布局 */
.moment__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

/* 顶部操作栏 */
.moment__header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid #EBEEF5;
  background: #FFFFFF;
  flex-shrink: 0;

  .refresh-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #F9FAFB;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .refresh-icon {
      width: 16px;
      height: 16px;
      transition: transform 0.3s ease;

      &.refreshing {
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 动态列表内容 */
.moment__content {
  flex: 1;
  overflow-y: auto;
  background: #F9FAFB;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F9FAFB;
  }

  &::-webkit-scrollbar-thumb {
    background: #B2BEC3;
    border-radius: 3px;

    &:hover {
      background: #636E72;
    }
  }
}

/* 动态项容器 */
.moment-items {
  padding: 0;
}

/* 状态样式 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EBEEF5;
  border-top: 3px solid #FF7D45;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text,
.empty-text {
  font-size: 14px;
  color: #636E72;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 12px;
  color: #B2BEC3;
}

.empty-icon {
  margin-bottom: 24px;

  img {
    width: 48px;
    height: 48px;
    opacity: 0.6;
  }
}

.load-more {
  padding: 16px;
  text-align: center;

  .load-more-text {
    font-size: 12px;
    color: #B2BEC3;
  }
}

/* 浮动发布按钮 */
.publish-float-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 125, 69, 0.3);
  z-index: 100;

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 125, 69, 0.4);
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  .publish-icon {
    width: 24px;
    height: 24px;
    filter: brightness(0) invert(1);
  }
}
</style>
