<template>
  <div class="incoming-view">
    <!-- 来电信息 -->
    <div class="caller-info">
      <div class="avatar-container pulse">
        <img :src="callerInfo.avatar || defaultAvatar" :alt="callerInfo.name">
      </div>
      <div class="caller-name">{{ callerInfo.name }}</div>
      <div class="status-label">邀请你进行音视频通话</div>
    </div>

    <!-- 操作区 -->
    <div class="action-bar">
      <!-- 拒绝 -->
      <div class="action-item reject" @click="handleReject">
        <div class="icon-circle">
          <img src="renderModule/assets/image/call/hangup.svg" alt="拒绝">
        </div>
        <span>拒绝</span>
      </div>

      <!-- 接听 -->
      <div class="action-item accept" @click="handleAccept">
        <div class="icon-circle">
          <img src="renderModule/assets/image/call/video.svg" alt="接听">
        </div>
        <span>接听</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { usecallStore } from '../../pinia/call'
import callManager from '../../core'

export default defineComponent({
  name: 'IncomingView',
  setup() {
    const callStore = usecallStore()
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=caller'

    // 来电者信息
    const callerInfo = ref<{ name: string; avatar: string }>({
      name: '来电中...',
      avatar: ''
    })

    // 从数据库加载来电者用户信息
    const loadCallerInfo = async () => {
      const callerId = callStore.baseInfo.callerId
      if (!callerId) return

      try {
        const result = await electron.database.user.getUsersBasicInfo({ userIds: [callerId] })
        if (result?.users?.length) {
          const user = result.users.find((u: any) => u.userId === callerId)
          if (user) {
            callerInfo.value = {
              name: user.nickName || user.userId || '未知用户',
              avatar: user.avatar || ''
            }
          }
        }
      } catch (error) {
        console.error('获取来电者用户信息失败:', error)
      }
    }

    onMounted(() => {
      loadCallerInfo()
    })

    const handleReject = () => {
      callManager.hangup()
    }

    const handleAccept = () => {
      callManager.acceptCall()
    }

    return {
      callerInfo,
      defaultAvatar,
      handleReject,
      handleAccept
    }
  }
})
</script>

<style lang="less" scoped>
.incoming-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #0f3443 0%, #34e89e 100%);
  color: #fff;

  .caller-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;

    .avatar-container {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.3);

      &.pulse {
        animation: pulse-green 2s infinite;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .caller-name {
      font-size: 24px;
      font-weight: 600;
    }

    .status-label {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .action-bar {
    padding: 40px 20px 60px;
    display: flex;
    justify-content: center;
    gap: 100px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;

      .icon-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;

        img {
          width: 36px;
          height: 36px;
          filter: invert(1);
        }
      }

      &.reject .icon-circle {
        background: #ff5252;
        box-shadow: 0 4px 20px rgba(255, 82, 82, 0.5);
      }

      &.accept .icon-circle {
        background: #00b894;
        box-shadow: 0 4px 20px rgba(0, 184, 148, 0.5);
      }

      &:hover .icon-circle {
        transform: scale(1.1);
      }

      span {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

@keyframes pulse-green {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(52, 232, 158, 0.7);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 30px rgba(52, 232, 158, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(52, 232, 158, 0);
  }
}
</style>
