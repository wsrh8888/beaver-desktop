<template>
  <div v-if="displayCalls.length > 0" class="incoming-call-list">
    <div v-for="call in displayCalls" :key="call.roomId" class="call-item" :class="call.status"
      @click="handleItemClick(call)">
      <div class="call-content">
        <div class="call-avatar">
          <img :src="getAvatar(call)" :alt="getName(call)">
          <div class="call-type-icon">
            <img v-if="call.callType === 'group'" src="renderModule/assets/image/call/group_call.svg" alt="群聊">
            <img v-else src="renderModule/assets/image/call/single_call.svg" alt="单聊">
          </div>
        </div>
        <div class="call-info">
          <div class="caller-name">{{ getName(call) }}</div>
          <div class="call-status">正在通话中</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useCallListStore, ICallItem } from 'renderModule/windows/app/pinia/call-list'
import { useActiveCallStore } from 'renderModule/windows/app/pinia/active-call'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'

export default defineComponent({
  name: 'IncomingCallList',
  setup() {
    const callListStore = useCallListStore()
    const activeCallStore = useActiveCallStore()
    const conversationStore = useConversationStore()
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=caller'

    // 获取需要显示的通话列表
    const displayCalls = computed(() => {
      // 显示所有来电和活跃通话
      return [...callListStore.incomingCalls, ...callListStore.activeCalls]
    })

    // 获取头像
    const getAvatar = (call: ICallItem) => {
      if (call.callType === 'group' && call.conversationId) {
        const conv = conversationStore.getConversationInfo(call.conversationId)
        if (conv && conv.avatar) return conv.avatar
      }
      return call.callerAvatar || defaultAvatar
    }

    // 获取名称（群名或人名）
    const getName = (call: ICallItem) => {
      if (call.callType === 'group' && call.conversationId) {
        const conv = conversationStore.getConversationInfo(call.conversationId)
        if (conv && conv.nickName) return conv.nickName
        return '群组通话'
      }
      return call.callerName || '未知用户'
    }

    // 点击列表项 - 打开确认窗口或回到通话窗口
    const handleItemClick = (call: ICallItem) => {
      console.error('handleItemClick', call)
      // 打开 call-incoming 确认窗口
      const { isInCall, currentRoomId } = activeCallStore

      // 如果已经在展示这个弹窗，可能只需 focus（这里简单处理为再次打开/置顶）
      electron?.window.openWindow('call-incoming', {
        width: 360,
        height: 180,
        params: {
          roomId: call.roomId,
          callerId: call.callerId,
          callType: call.callType,
          conversationId: call.conversationId,
          // 传递当前活跃通话状态，用于 call-incoming 里的二次确认判断
          hasActiveCall: isInCall,
          activeCallRoomId: currentRoomId
        }
      })
    }

    return {
      displayCalls,
      defaultAvatar,
      getAvatar,
      getName,
      handleItemClick
    }
  }
})
</script>

<style lang="less" scoped>
.incoming-call-list {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #EBEEF5;
  background: #F0F9FF;
  /* 浅蓝色背景凸显 */

  .call-item {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #E1F2FE;
    }

    &.incoming {
      background: #E8F5E9;

      /* 浅绿色背景表示来电 */
      &:hover {
        background: #C8E6C9;
      }
    }

    .call-content {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;

      .call-avatar {
        position: relative;
        width: 40px;
        height: 40px;
        margin-right: 12px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          object-fit: cover;
        }

        .call-type-icon {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: #2D8CF0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid white;

          img {
            width: 10px;
            height: 10px;
            filter: brightness(0) invert(1);
          }
        }
      }

      .call-info {
        flex: 1;
        min-width: 0;

        .caller-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .call-status {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .call-actions {
      display: flex;
      gap: 8px;
      margin-left: 8px;

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;

        img {
          width: 16px;
          height: 16px;
          filter: brightness(0) invert(1);
        }

        &:hover {
          transform: scale(1.1);
        }

        &.accept {
          background: #4CAF50;
          color: white;
          box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
        }

        &.reject {
          background: #FF5252;
          color: white;
          box-shadow: 0 2px 4px rgba(255, 82, 82, 0.3);
        }
      }
    }

    .active-indicator {
      display: flex;
      align-items: center;
      gap: 3px;
      margin-left: 10px;

      .wave {
        width: 3px;
        background: #4CAF50;
        animation: wave 1.2s infinite ease-in-out;
        border-radius: 2px;

        &:nth-child(1) {
          height: 10px;
          animation-delay: 0s;
        }

        &:nth-child(2) {
          height: 16px;
          animation-delay: 0.1s;
        }

        &:nth-child(3) {
          height: 12px;
          animation-delay: 0.2s;
        }
      }
    }
  }
}

@keyframes wave {

  0%,
  100% {
    transform: scaleY(0.6);
    opacity: 0.6;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
