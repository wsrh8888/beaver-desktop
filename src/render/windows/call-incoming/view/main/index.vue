<template>
  <div class="incoming-main">
    <div class="notify-card">
      <div class="caller-info">
        <div class="text-info">
          <div class="name">{{ callerInfo.name || '来电中...' }}</div>
          <div class="desc">邀请您进行视频通话</div>
        </div>
      </div>

      <div class="action-group">
        <div class="action-btn reject" @click="handleReject">
          <img src="renderModule/assets/image/call/hangup.svg" alt="reject">
        </div>
        <div class="action-btn accept" @click="handleAccept">
          <img src="renderModule/assets/image/call/accept.svg" alt="accept">
        </div>
      </div>

      <!-- 冲突确认 -->
      <div v-if="showConfirm" class="confirm-overlay">
        <div class="confirm-modal">
          <p>您正在通话中，接听将挂断当前通话</p>
          <div class="modal-btns">
            <button class="cancel" @click="showConfirm = false">取消</button>
            <button class="confirm" @click="confirmAccept">接听</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import { useIncomingStore } from '../../pinia/incoming'
import { getCallTokenApi, hangupCallApi } from 'renderModule/api/call'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'IncomingMain',
  components: {
    BeaverImage
  },
  setup() {
    const incomingStore = useIncomingStore()
    const showConfirm = ref(false)

    const callerInfo = computed(() => incomingStore.callerInfo)

    const loadCallerInfo = async () => {
      const callerId = incomingStore.callInfo.callerId
      if (!callerId) return

      try {
        const result = await (window as any).electron.database.user.getUsersBasicInfo({ userIds: [callerId] })
        if (result?.users?.length) {
          const user = result.users.find((u: any) => u.userId === callerId)
          if (user) {
            incomingStore.setCallerInfo({
              name: user.nickName || user.userId || '未知用户',
              avatar: user.avatar || ''
            })
          }
        }
      } catch (error) {
        console.error('获取来电者信息失败:', error)
      }
    }

    onMounted(() => {
      loadCallerInfo()
    })

    const handleReject = async () => {
      try {
        await hangupCallApi({
          roomId: incomingStore.callInfo.roomInfo.roomId
        })
      } finally {
        (window as any).electron?.window.closeWindow()
      }
    }

    const handleAccept = () => {
      if (incomingStore.callInfo.hasActiveCall) {
        showConfirm.value = true
        return
      }
      confirmAccept()
    }

    const confirmAccept = async () => {
      const { roomInfo, callType, callerId, conversationId, callMode, role, hasActiveCall, activeCallRoomId } = incomingStore.callInfo
      const roomId = roomInfo.roomId

      if (hasActiveCall && activeCallRoomId) {
        try {
          await hangupCallApi({ roomId: activeCallRoomId })
        } catch (e) {
          console.warn('挂断旧通话失败', e)
        }
      }

      try {
        const res = await getCallTokenApi({ roomId })
        if (res.code === 0) {
          const { roomToken, liveKitUrl, participants } = res.result
          const fullRoomInfo = { ...roomInfo, roomToken, liveKitUrl };

          (window as any).electron?.window.openWindow('call', {
            params: {
              roomInfo: { ...fullRoomInfo },
              baseInfo: { callMode, targetId: [], callerId, conversationId, callType, role },
              participants: participants || []
            }
          });

          (window as any).electron?.window.closeWindow()
        }
      } catch (error) {
        console.error('接听流程异常:', error)
      }
    }

    return {
      callerInfo,
      handleReject,
      handleAccept,
      showConfirm,
      confirmAccept,
      CacheType
    }
  }
})
</script>

<style lang="less" scoped>
.incoming-main {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.notify-card {
  width: 100%; // 让卡片充满布局容器
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  height: 100%;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  border: 1px solid #f0f0f0;
}

.caller-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .avatar-wrap {
    width: 64px;
    height: 64px;
    position: relative;

    .caller-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 2;
      position: relative;
    }

    .pulse-ring {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid #ff7d45;
      border-radius: 50%;
      animation: pulse 2s infinite;
      z-index: 1;
    }
  }

  .text-info {
    text-align: center;

    .name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .desc {
      font-size: 13px;
      color: #999;
    }
  }
}

.action-group {
  display: flex;
  justify-content: center;
  gap: 40px;

  .action-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    img {
      width: 24px;
      height: 24px;
      filter: brightness(0) invert(1);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    &.reject {
      background: #ff5252;

      &:hover {
        background: #ff3d3d;
      }
    }

    &.accept {
      background: #00c853;

      &:hover {
        background: #00b34a;
      }
    }
  }
}

.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10;

  .confirm-modal {
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    p {
      font-size: 13px;
      color: #333;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .modal-btns {
      display: flex;
      gap: 12px;
      justify-content: center;

      button {
        padding: 6px 16px;
        border-radius: 6px;
        font-size: 12px;
        border: none;
        cursor: pointer;
        font-weight: 500;
      }

      .cancel {
        background: #f0f0f0;
        color: #666;
      }

      .confirm {
        background: #ff5252;
        color: #fff;
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
</style>
