<template>
  <div v-if="displayCalls.length > 0" class="incoming-call-list">
    <div v-for="call in displayCalls" :key="call.roomId" class="call-item" :class="call.status"
      @click="handleItemClick(call)">
      <div class="call-info">
        {{ getName(call) }} 正在通话中
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

    // 获取需要显示的通话列表
    const displayCalls = computed(() => {
      // 显示所有来电和活跃通话
      return [...callListStore.incomingCalls, ...callListStore.activeCalls]
    })

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
  background: #E8F5E9;
  border-bottom: 1px solid #C8E6C9;

  .call-item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #C8E6C9;
    }

    .call-info {
      font-size: 13px;
      color: #2E7D32;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      width: 100%;
    }
  }
}
</style>
