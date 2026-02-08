<template>
  <div class="incoming-notify">
    <!-- 来电者信息 -->
    <div class="caller-section">
      <div class="avatar">
        <img :src="callerInfo.avatar || defaultAvatar" :alt="callerInfo.name">
      </div>
      <div class="info">
        <div class="name">{{ callerInfo.name || '来电中...' }}</div>
        <div class="status">正在呼叫你...</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <div class="action-btn reject" @click="handleReject" title="拒绝">
        <img src="renderModule/assets/image/call/hangup.svg" alt="拒绝">
      </div>
      <div class="action-btn accept" @click="handleAccept" title="接听">
        <img src="renderModule/assets/image/call/accept.svg" alt="接听">
      </div>
    </div>

    <!-- 关闭按钮 -->
    <div class="close-btn" @click="handleClose" title="忽略">
      <img src="renderModule/assets/image/call/close.svg" alt="忽略">
    </div>

    <!-- 确认弹窗 -->
    <div v-if="showConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>您正在通话中，接听将挂断当前通话</p>
        <div class="confirm-btns">
          <button class="cancel" @click="showConfirm = false">取消</button>
          <button class="confirm" @click="confirmAccept">接听</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import { useIncomingStore } from '../pinia/incoming'
import { getCallTokenApi, hangupCallApi } from 'renderModule/api/call'

export default defineComponent({
  name: 'IncomingNotify',
  setup() {
    const incomingStore = useIncomingStore()
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=caller'
    const showConfirm = ref(false)

    // 来电者信息
    const callerInfo = computed(() => incomingStore.callerInfo)

    // 从数据库加载来电者信息
    const loadCallerInfo = async () => {
      const callerId = incomingStore.callInfo.callerId
      if (!callerId) return

      try {
        const result = await electron.database.user.getUsersBasicInfo({ userIds: [callerId] })
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

    // 拒绝来电
    const handleReject = async () => {
      try {
        await hangupCallApi({
          roomId: incomingStore.callInfo.roomInfo.roomId
        })
      } catch (e) {
        console.error('拒绝来电失败:', e)
      }
      electron?.window.closeWindow()
    }

    // 点击接听按钮
    const handleAccept = () => {
      // 检查是否有活跃通话
      if (incomingStore.callInfo.hasActiveCall) {
        showConfirm.value = true
        return
      }
      confirmAccept()
    }

    // 确认接听 - 打开完整的 call 窗口
    const confirmAccept = async () => {
      const { roomInfo, callType, callerId, conversationId, callMode, role, type, hasActiveCall, activeCallRoomId } = incomingStore.callInfo
      const roomId = roomInfo.roomId

      // 1. 如果有活跃通话，先挂断
      if (hasActiveCall && activeCallRoomId) {
        try {
          await hangupCallApi({ roomId: activeCallRoomId })
        } catch (e) {
          console.warn('挂断旧通话失败', e)
        }
      }

      // 2. 获取通话令牌 (移动到此处处理)
      try {
        const res = await getCallTokenApi({ roomId })

        if (res.code === 0) {
          const { roomToken, liveKitUrl, participants } = res.result

          // 3. 组装完整的房间信息
          const fullRoomInfo = {
            ...roomInfo,
            roomToken,
            liveKitUrl
          }

          // 4. 打开新窗口 (附带名单快照)
          electron?.window.openWindow('call', {
            params: {
              roomInfo: { ...fullRoomInfo },
              baseInfo: {
                callMode,
                targetId: [],
                callerId,
                conversationId,
                callType,
                role
              },
              participants: participants || []
            }
          })

          // 5. 关闭自己
          electron?.window.closeWindow()
        } else {
          console.error('获取令牌失败:', res.msg)
          // 可以加个 Toast 提示用户
        }
      } catch (error) {
        console.error('接听流程异常:', error)
      }
    }

    // 忽略/关闭
    const handleClose = () => {
      electron?.window.closeWindow()
    }

    return {
      callerInfo,
      defaultAvatar,
      handleReject,
      handleAccept,
      handleClose,
      showConfirm,
      confirmAccept
    }
  }
})
</script>

<style lang="less" scoped>
.incoming-notify {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  position: relative;
  box-sizing: border-box;

  .caller-section {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 12px;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.3);
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      .name {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .status {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .actions {
    display: flex;
    gap: 12px;

    .action-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;

      img {
        width: 22px;
        height: 22px;
        filter: invert(1) brightness(2);
        /* 确保变白 */
      }

      &:hover {
        transform: scale(1.1);
      }

      &.reject {
        background: #ff5252;
      }

      &.accept {
        background: #00c853;
      }
    }
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;

    img {
      width: 16px;
      height: 16px;
      filter: invert(1);
    }

    &:hover {
      opacity: 1;
    }
  }

  .confirm-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border-radius: 12px;

    .confirm-box {
      background: white;
      padding: 16px;
      border-radius: 8px;
      width: 80%;
      text-align: center;

      p {
        font-size: 14px;
        color: #333;
        margin-bottom: 16px;
      }

      .confirm-btns {
        display: flex;
        gap: 12px;
        justify-content: center;

        button {
          padding: 6px 16px;
          border-radius: 4px;
          border: none;
          font-size: 12px;
          cursor: pointer;

          &.cancel {
            background: #f5f5f5;
            color: #666;
          }

          &.confirm {
            background: #ff5252;
            color: white;
          }
        }
      }
    }
  }
}
</style>
```
