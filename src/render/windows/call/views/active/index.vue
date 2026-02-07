<template>
  <div class="active-view">
    <!-- 顶部信息区域（对方头像、名字、状态） -->
    <div class="call-info">
      <div class="avatar-container" :class="{ 'pulse': isWaiting }">
        <img :src="targetInfo.avatar || defaultAvatar" :alt="targetInfo.name">
      </div>
      <div class="target-name">{{ targetInfo.name }}</div>
      <div class="status-label">{{ statusText }}</div>
    </div>

    <!-- 中间通话内容区域（视频流可以放这里） -->
    <div class="call-content">
      <!-- 后续可接入 LiveKit 视频流 -->
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-bar">
      <!-- 静音 -->
      <div class="action-item" :class="{ active: callStore.callStatus.isMuted }" @click="handleToggleMute">
        <div class="icon-circle">
          <img v-if="callStore.callStatus.isMuted" src="renderModule/assets/image/call/mute_on.svg" alt="取消静音">
          <img v-else src="renderModule/assets/image/call/mute.svg" alt="静音">
        </div>
        <span>{{ callStore.callStatus.isMuted ? '取消静音' : '静音' }}</span>
      </div>

      <!-- 摄像头 -->
      <div class="action-item" :class="{ active: !callStore.callStatus.isCameraOff }" @click="handleToggleCamera">
        <div class="icon-circle">
          <img v-if="callStore.callStatus.isCameraOff" src="renderModule/assets/image/call/video_off.svg" alt="开启视频">
          <img v-else src="renderModule/assets/image/call/video.svg" alt="关闭视频">
        </div>
        <span>{{ callStore.callStatus.isCameraOff ? '开启视频' : '关闭视频' }}</span>
      </div>

      <!-- 挂断 -->
      <div class="action-item hangup" @click="handleHangup">
        <div class="icon-circle">
          <img src="renderModule/assets/image/call/hangup.svg" alt="挂断">
        </div>
        <span>{{ isWaiting ? '取消' : '挂断' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { usecallStore } from '../../pinia/call'
import callManager from '../../core'

export default defineComponent({
  name: 'ActiveView',
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

    // 状态文字
    const statusText = computed(() => {
      if (callStore.callStatus.phase === 'calling') {
        return '正在呼叫...'
      }
      return '通话中'
    })

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

    const handleToggleMute = () => {
      callManager.toggleMute()
    }

    const handleToggleCamera = () => {
      callManager.toggleCamera()
    }

    const handleHangup = () => {
      callManager.hangup()
    }

    return {
      callStore,
      isWaiting,
      targetInfo,
      statusText,
      defaultAvatar,
      handleToggleMute,
      handleToggleCamera,
      handleHangup
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

  .call-info {
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

  .call-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-bar {
    padding: 30px 20px 40px;
    display: flex;
    justify-content: center;
    gap: 50px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;

      .icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        img {
          width: 28px;
          height: 28px;
          filter: invert(1);
        }
      }

      &.active .icon-circle {
        background: rgba(255, 255, 255, 0.3);
      }

      &.hangup .icon-circle {
        background: #ff5252;
        box-shadow: 0 4px 15px rgba(255, 82, 82, 0.4);
      }

      &:hover .icon-circle {
        transform: scale(1.1);
      }

      span {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }
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
