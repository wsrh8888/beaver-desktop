<template>
  <div class="chat-header">
    <div class="user-info">
      <div class="user-avatar">
        <BeaverImage :file-name="friendInfo.avatar" alt="用户头像" image-class="user-avatar-image" />
      </div>
      <div class="user-details">
        <div class="user-name">
          {{ friendInfo?.nickname }}
        </div>
      </div>
    </div>
    <div class="header-actions">
      <div class="action-btn" @click="handlePhone">
        <img src="renderModule/assets/image/chat/phone.svg" alt="语音通话">
      </div>
      <div class="action-btn" @click="handleVideo">
        <img src="renderModule/assets/image/chat/video.svg" alt="视频通话">
      </div>
      <div class="action-btn" @click="handleMore">
        <img src="renderModule/assets/image/chat/more.svg" alt="更多">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  components: {
    BeaverImage,
  },
  emits: ['showGroupDetails', 'showPrivateDetails', 'showAiDetails'],
  setup(props, { emit }) {
    const conversationStore = useConversationStore()
    const messageViewStore = useMessageViewStore()

    const friendInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      return currentId ? conversationStore.getConversationInfo(currentId) : {}
    })
    // 判断当前会话类型
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
      else if (friendInfo.value.chatType === 3) {
        return 'ai' // AI聊天
      }
      return null
    })

    const handlePhone = () => {
      // 语音通话功能
    }

    const handleVideo = () => {
      // 视频通话功能
    }

    // 处理点击更多按钮
    const handleMore = () => {
      // 根据会话类型发出不同的事件
      console.log('1111111111111111', chatType)
      switch (chatType.value) {
        case 'private':
          emit('showPrivateDetails')
          break
        case 'group':
          emit('showGroupDetails')
          break
        case 'ai':
          emit('showAiDetails')
          break
        default:
          // 默认行为或错误处理
          console.log('未知的会话类型')
          break
      }
    }
    // 移除 previewOnlineFile 函数，因为现在使用 BeaverImage 组件
    return {
      friendInfo,
      chatType,
      handlePhone,
      handleVideo,
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
