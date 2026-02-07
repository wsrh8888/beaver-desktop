<template>
  <div class="notify-view">
    <!-- 来电者信息 -->
    <div class="caller-section">
      <div class="avatar">
        <img :src="callerInfo.avatar || defaultAvatar" :alt="callerInfo.name">
      </div>
      <div class="info">
        <div class="name">{{ callerInfo.name }}</div>
        <div class="status">正在呼叫你...</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <div class="action-btn reject" @click="handleReject" title="拒绝">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
        </svg>
      </div>
      <div class="action-btn accept" @click="handleAccept" title="接听">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
        </svg>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <div class="close-btn" @click="handleClose" title="忽略">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { usecallStore } from '../../pinia/call'

export default defineComponent({
  name: 'NotifyView',
  setup() {
    const callStore = usecallStore()
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=caller'

    // 来电者信息
    const callerInfo = ref<{ name: string; avatar: string }>({
      name: '来电中...',
      avatar: ''
    })

    // 从数据库加载来电者信息
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
        console.error('获取来电者信息失败:', error)
      }
    }

    onMounted(() => {
      loadCallerInfo()
    })

    // 拒绝来电 - 发送拒绝信令并关闭窗口
    const handleReject = async () => {
      try {
        // 导入并调用挂断 API
        const { hangupCallApi } = await import('renderModule/api/call')
        await hangupCallApi({
          roomId: callStore.roomInfo.roomId
        })
      } catch (e) {
        console.error('拒绝来电失败:', e)
      }
      // 关闭窗口
      electron?.window.closeWindow()
    }

    // 接听来电 - 打开完整的 call 窗口
    const handleAccept = () => {
      // 打开完整的 call 窗口
      electron?.window.openWindow('call', {
        width: 1000,
        height: 640,
        params: {
          roomId: callStore.roomInfo.roomId,
          callType: callStore.baseInfo.callType,
          callerId: callStore.baseInfo.callerId,
          conversationId: callStore.baseInfo.conversationId,
          callMode: callStore.baseInfo.callMode,
          role: 'callee',
          autoAccept: true // 标记自动接听
        }
      })
      // 关闭当前来电提示窗口
      electron?.window.closeWindow()
    }

    // 忽略/关闭 - 只关闭窗口，不发送信令
    const handleClose = () => {
      electron?.window.closeWindow()
    }

    return {
      callerInfo,
      defaultAvatar,
      handleReject,
      handleAccept,
      handleClose
    }
  }
})
</script>

<style lang="less" scoped>
.notify-view {
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

      svg {
        width: 22px;
        height: 22px;
      }

      &:hover {
        transform: scale(1.1);
      }

      &.reject {
        background: #ff5252;
        color: #fff;
      }

      &.accept {
        background: #00c853;
        color: #fff;
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
    color: rgba(255, 255, 255, 0.6);
    transition: color 0.2s;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: #fff;
    }
  }
}
</style>
