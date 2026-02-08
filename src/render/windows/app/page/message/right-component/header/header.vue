<template>
  <div class="chat-header">
    <div class="user-info">
      <div class="user-avatar">
        <BeaverImage :file-name="friendInfo?.avatar" alt="用户头像" image-class="user-avatar-image" />
      </div>
      <div class="user-details">
        <div class="user-name">
          {{ friendInfo?.nickName }}
        </div>
      </div>
    </div>
    <div class="header-actions">
      <div class="action-btn" @click="handleCall('audio')">
        <img src="renderModule/assets/image/chat/phone.svg" alt="语音通话">
      </div>
      <div class="action-btn" @click="handleCall('video')">
        <img src="renderModule/assets/image/chat/video.svg" alt="视频通话">
      </div>
      <div class="action-btn" @click="handleMore">
        <img src="renderModule/assets/image/chat/more.svg" alt="更多">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { startCallApi } from 'renderModule/api/call'
import { computed, defineComponent, watch } from 'vue'

export default defineComponent({
  components: {
    BeaverImage,
  },
  emits: ['showDetails'],
  setup(_props, { emit }) {
    const conversationStore = useConversationStore()
    const messageViewStore = useMessageViewStore()
    const friendStore = useFriendStore()
    const userStore = useUserStore()
    const groupStore = useGroupStore()

    const friendInfo = computed<any>(() => {
      const currentId = messageViewStore.currentChatId
      return currentId ? conversationStore.getConversationInfo(currentId) || {} : {}
    })
    watch(() => messageViewStore.currentChatId, async (newConversationId) => {
      // 判断当前会话类型
      if (newConversationId) {
        console.error('会话变了', newConversationId)
        conversationStore.initConversationById(newConversationId)
      }
    })
    const chatType = computed(() => {
      if (!friendInfo.value)
        return null

      // 根据会话ID或其他属性判断会话类型
      if (friendInfo.value.chatType === 1) {
        return 'private' // 私聊
      }
      else if (friendInfo.value.chatType === 2) {
        return 'group' // 群聊
      }
      return null
    })

    const handleCall = async (type: 'audio' | 'video') => {
      const currentId = messageViewStore.currentChatId
      if (!currentId) return

      // 获取目标 ID：私聊解析出对方 UID，群聊使用会话 ID (即群 ID)
      const targetUserId = chatType.value === 'private'
        ? friendStore.getUserIdByConversationId(currentId)
        : groupStore.getGroupIdByConversationId(currentId)

      // 获取当前用户 ID（发起者）
      const callerId = userStore.getUserId

      // 先调用 API 发起通话
      const res = await startCallApi({
        callType: chatType.value === 'private' ? 1 : 2,
        targetId: targetUserId,
        callMode: type === 'audio' ? 1 : 2,
      })

      if (res.code === 0) {
        const { participants, ...roomInfo } = res.result

        console.error('targetUserId', targetUserId)
        console.error('participants', participants)

        // 成功获取房间信息后，打开 Call 窗口 (名单从接口拿)
        electron?.window.openWindow('call', {
          params: {
            baseInfo: {
              callMode: type,
              // 这里修正：targetId 代表具体的呼叫对象。
              // 对于群聊，我们设为空，完全依赖 participants 返回的成员快照来驱动 UI
              targetId: chatType.value === 'private' ? [targetUserId] : [],
              callerId: callerId,
              conversationId: currentId,
              callType: chatType.value,
              role: 'caller'
            },
            roomInfo,
            participants
          }
        })
      } else {
        console.error('发起通话失败:', res.msg)
      }
    }

    // 处理点击更多按钮
    const handleMore = () => {
      if (chatType.value) {
        emit('showDetails', chatType.value)
      }
    }
    // 移除 previewOnlineFile 函数，因为现在使用 BeaverImage 组件
    return {
      friendInfo,
      chatType,
      handleCall,
      handleMore,
      // 移除 previewOnlineFile
    }
  },
})
</script>

<style lang="less" scoped>
.chat-header {
  height: 64px;
  border-bottom: 1px solid #EBEEF5;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;

  .user-info {
    display: flex;
    align-items: center;

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
      position: relative;
      overflow: hidden;

      .user-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-details {
      display: flex;
      flex-direction: column;

      .user-name {
        font-size: 16px;
        font-weight: 500;
        color: #2D3436;
        margin-bottom: 2px;
      }

      .user-status {
        font-size: 12px;
        color: #B2BEC3;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2D3436;
      margin-left: 8px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #F9FAFB;
        color: #FF7D45;
      }

      img {
        width: 20px;
        height: 20px;
        stroke: currentColor;
      }
    }
  }
}
</style>
