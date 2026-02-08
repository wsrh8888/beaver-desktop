<template>
  <div class="active-view">
    <!-- 视频通话区域 -->
    <div v-if="hasVideo" class="video-container">
      <!-- 远程视频网格 -->
      <div class="remote-grid" :class="gridClass">
        <div v-for="trackInfo in callStore.remoteVideoTracks" :key="trackInfo.sid" class="video-item">
          <VideoRenderer :track="trackInfo.track" />
          <div class="user-label">{{ trackInfo.identity }}</div>
        </div>
      </div>

      <!-- 本地视频 (画中画) -->
      <div v-if="callStore.localVideoTrack" class="local-pip">
        <VideoRenderer :track="callStore.localVideoTrack" :is-local="true" />
      </div>

      <!-- 如果只有本地视频没有远程视频（等待中或对方没开视频），显示大图或者保持布局 -->
      <div v-if="callStore.remoteVideoTracks.length === 0 && callStore.localVideoTrack" class="no-remote-placeholder">
        <div class="waiting-text">等待对方开启视频...</div>
      </div>
    </div>

    <!-- 语音通话/无视频状态 -->
    <div v-else class="call-info">
      <div class="avatar-container" :class="{ 'pulse': isWaiting }">
        <img :src="targetInfo.avatar || defaultAvatar" :alt="targetInfo.name">
      </div>
      <div class="target-name">{{ targetInfo.name }}</div>
      <div class="status-label">{{ statusText }}</div>
    </div>


  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { usecallStore } from '../pinia/call'

import VideoRenderer from './VideoRenderer.vue'

export default defineComponent({
  name: 'CallView',
  components: {
    VideoRenderer
  },
  setup() {
    const callStore = usecallStore()
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

    // 目标用户信息
    const targetInfo = ref<{ name: string; avatar: string }>({
      name: '加载中...',
      avatar: ''
    })

    // 是否处于等待状态（拨打中）
    const isWaiting = computed(() => callStore.callStatus.phase === 'calling')

    // 是否有视频 (本地或远程有视频轨道即视为视频模式)
    const hasVideo = computed(() => {
      return (callStore.remoteVideoTracks && callStore.remoteVideoTracks.length > 0) ||
        (callStore.localVideoTrack !== null)
    })

    // 网格样式类
    const gridClass = computed(() => {
      const count = callStore.remoteVideoTracks.length
      if (count <= 1) return 'grid-1'
      if (count <= 2) return 'grid-2'
      if (count <= 4) return 'grid-4'
      return 'grid-9'
    })

    // 状态文字
    const statusText = computed(() => {
      if (callStore.callStatus.phase === 'calling') {
        return '正在呼叫...'
      }
      return '通话中'
    })

    // ... (keep loadTargetInfo logic)
    // 从数据库加载目标用户信息
    const loadTargetInfo = async () => {
      const targetId = callStore.baseInfo.targetId?.[0]
      if (!targetId) return

      try {
        const result = await electron.database.user.getUsersBasicInfo({ userIds: [targetId] })
        if (result?.users?.length) {
          const user = result.users.find((u: any) => u.userId === targetId)
          if (user) {
            targetInfo.value = {
              name: user.nickName || user.userId || '未知用户',
              avatar: user.avatar || ''
            }
          }
        }
      } catch (error) {
        console.error('获取目标用户信息失败:', error)
      }
    }

    onMounted(() => {
      loadTargetInfo()
    })

    return {
      callStore,
      isWaiting,
      targetInfo,
      statusText,
      defaultAvatar,
      hasVideo,
      gridClass,
    }
  }
})
</script>

<style lang="less" scoped>
.active-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  position: relative;
  overflow: hidden;

  .video-container {
    flex: 1;
    position: relative;
    background: #000;
    display: flex;
    flex-direction: column;

    .remote-grid {
      flex: 1;
      display: grid;
      gap: 2px;

      &.grid-1 {
        grid-template-columns: 1fr;
      }

      &.grid-2 {
        grid-template-columns: 1fr 1fr;
      }

      &.grid-4 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
      }

      .video-item {
        position: relative;
        background: #222;

        .user-label {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.5);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 2;
        }
      }
    }

    .local-pip {
      position: absolute;
      bottom: 100px;
      right: 20px;
      width: 120px;
      height: 160px; // 3:4 aspect ratio
      background: #333;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      overflow: hidden;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: all 0.3s;

      &:hover {
        transform: scale(1.1);
      }
    }

    .no-remote-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }
  }

  .call-info {
    // ... keep existing styles for call-info
    padding: 40px 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .avatar-container {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.2);

      &.pulse {
        animation: pulse-ring 2s infinite;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .target-name {
      font-size: 22px;
      font-weight: 500;
    }

    .status-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }


}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
</style>
