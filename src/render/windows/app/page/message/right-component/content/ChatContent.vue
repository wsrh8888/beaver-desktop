<template>
  <div ref="messageContainer" class="chat-messages">
    <div
      v-for="message in messages" :key="message.messageId" class="message"
      :class="{
        send: message.sender.userId === userStore.userInfo.userId,
        system: message.sender.userId === '',
      }"
    >
      <div v-if="message.sender.userId" class="message-avatar">
        <BeaverImage
          :cache-type="CacheType.USER_AVATAR"
          :file-name="message.sender.avatar" :alt="message.sender.nickname"
          image-class="avatar-image" @click.stop="showUserInfo($event, message)"
        />
      </div>
      <div class="message-content" @contextmenu.prevent="handleContextMenu($event, message)">
        <!-- 文本消息组件 -->
        <TextMessage
          v-if="message.msg.type === 1"
          :message="message"
        />
        <!-- 图片消息组件 -->
        <ImageMessage
          v-else-if="message.msg.type === 2 && message.msg.imageMsg"
          :message="message"
        />
        <!-- 视频消息组件 -->
        <VideoMessage
          v-else-if="message.msg.type === 3 && message.msg.videoMsg"
          :message="message"
        />
        <!-- 音频文件消息组件（type=8 的音频文件消息，用户上传的音频文件） -->
        <AudioFileMessage
          v-else-if="message.msg.type === 8"
          :message="message"
        />
        <!-- 发送状态指示器 -->
        <!-- <div v-if="message.sendStatus !== undefined && message.sender.userId === userStore.userInfo.userId" class="message-status">
          <div v-if="message.sendStatus === 0" class="status-sending">
            <div class="sending-spinner" />
            发送中...
          </div>
          <div v-else-if="message.sendStatus === 2" class="status-failed" @click="retrySend(message)">
            <img class="retry-icon" src="@/render/assets/image/chat/retry.svg" alt="重试" />
            发送失败，点击重试
          </div>
        </div>-->
      </div> 
    </div>

    <!-- 右键菜单组件 -->
    <ContextMenu
      :trigger="'manual'"
      :visible="contextMenuVisible"
      :menu-items="contextMenuItems"
      :position="contextMenuPosition"
      @update:visible="contextMenuVisible = $event"
      @command="(item) => handleMenuCommand(item, currentMessage)"
    />
    <UserInfo v-if="userInfo.show" :user-info="userInfo" />
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { useMessageStore } from 'renderModule/windows/app/pinia/message/message'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import ContextMenu from 'renderModule/components/ui/context-menu/index.vue'
import AudioFileMessage from './components/AudioFileMessage.vue'
import TextMessage from './components/TextMessage.vue'
import ImageMessage from './components/ImageMessage.vue'
import VideoMessage from './components/VideoMessage.vue'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import userInfo from './userInfo.vue'
import { getMenuItems, MessageContentType } from './data'
import { copyToClipboard, hasTextSelected } from './copy'
import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'

export default defineComponent({
  components: {
    UserInfo: userInfo,
    BeaverImage,
    ContextMenu,
    AudioFileMessage,
    TextMessage,
    ImageMessage,
    VideoMessage,
  },
  setup() {
    const userInfo = ref({
      show: false,
      position: {
        top: '0px',
        left: '0px',
        // right: '0px'
      },
      friendId: 0,
    })
    const userStore = useUserStore()
    const messageStore = useMessageStore()
    const messageViewStore = useMessageViewStore()
    const messageContainer = ref<HTMLElement | null>(null)
    // 右键菜单相关状态
    const contextMenuVisible = ref(false)
    const contextMenuPosition = ref<{ x: number, y: number } | null>(null)
    const contextMenuItems = ref<ContextMenuItem[]>([])
    const currentMessage = ref<any>(null) // 当前右键点击的消息

    const messages = computed(() => {
      const currentId = messageViewStore.currentChatId
      return currentId ? messageStore.getChatHistory(currentId) : []
    })

    // 判断messageViewStore.currentChatId的值是否发生变化
    watch(() => messageViewStore.currentChatId, () => {
      if (messageViewStore.currentChatId) {
        console.error('messageViewStore.currentChatId 发生变化', messageViewStore.currentChatId)
        messageStore.init(messageViewStore.currentChatId)
      }
    })

    // 处理右键菜单
    const handleContextMenu = (event: MouseEvent, message: any) => {
      event.preventDefault()
      event.stopPropagation()

      // 保存当前消息，用于菜单命令处理
      currentMessage.value = message

      // 获取消息类型
      const messageType = message.msg.type as MessageContentType
      
      // 检查是否有文本被选中（仅对文本消息有效）
      const hasSelected = messageType === MessageContentType.TEXT && hasTextSelected()
      
      // 根据消息类型获取菜单项
      contextMenuItems.value = getMenuItems(messageType, hasSelected)
      
      // 设置菜单位置
      contextMenuPosition.value = {
        x: event.clientX,
        y: event.clientY,
      }
      
      // 显示菜单
      contextMenuVisible.value = true
    }

    // 处理菜单项点击
    const handleMenuCommand = async (item: ContextMenuItem, message?: any) => {
      switch (item.id) {
        case 'copy': {
          // 复制文本（文本消息）
          const selectedText = window.getSelection()?.toString().trim() || ''
          if (selectedText) {
            await copyToClipboard(selectedText)
          }
          break
        }
        case 'save': {
          // 保存文件（图片/视频/音频/文件）
          console.log('保存文件功能开发中', message)
          break
        }
        case 'view': {
          // 查看原图（图片消息）
          console.log('查看原图功能开发中', message)
          break
        }
        case 'play': {
          // 播放（视频/音频消息）
          console.log('播放功能开发中', message)
          break
        }
        case 'open': {
          // 打开文件（文件消息）
          console.log('打开文件功能开发中', message)
          break
        }
        case 'forward': {
          // 转发消息
          console.log('转发消息功能开发中', message)
          break
        }
        case 'delete': {
          // 删除消息
          console.log('删除消息功能开发中', message)
          break
        }
        default:
          console.log('未知菜单项:', item)
      }
    }

    // 点击其他地方时隐藏用户信息
    const hideDialog = () => {
      userInfo.value.show = false
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    }


    // 处理滚动事件，检测是否需要加载更多历史消息
    const handleScroll = async () => {
      if (!messageContainer.value)
        return

      const { scrollTop, scrollHeight } = messageContainer.value
      const isNearTop = scrollTop <= 50 // 距离顶部50px以内
      const currentId = messageViewStore.currentChatId

      if (isNearTop && currentId) {
        const pagination = messageStore.getMessagePagination(currentId)
        if (pagination.hasMore && !pagination.isLoadingMore) {
          console.log('触发加载更多历史消息')

          // 记录加载前的滚动高度，用于保持滚动位置
          const prevScrollHeight = scrollHeight

          await messageStore.loadMoreChatHistory(currentId)

          // 等待DOM更新后调整滚动位置
          await nextTick()
          if (messageContainer.value) {
            const newScrollHeight = messageContainer.value.scrollHeight
            const heightDiff = newScrollHeight - prevScrollHeight
            messageContainer.value.scrollTop = scrollTop + heightDiff
          }
        }
      }
    }

    watch(messages, () => {
      scrollToBottom()
    }, { deep: true })

    onMounted(() => {
      scrollToBottom()
      // 添加全局点击事件监听
      document.addEventListener('click', hideDialog)
      // 添加滚动监听器
      if (messageContainer.value) {
        messageContainer.value.addEventListener('scroll', handleScroll)
      }
    })
    const showUserInfo = (event: MouseEvent, message: any) => {
      if (message.sender.userId === userStore.userInfo.userId) {
        return
      }
      userInfo.value.show = false
      userInfo.value.show = true
      userInfo.value.position = {
        top: `${event.clientY}px`,
        left: `${event.clientX + 18}px`,
      }

      userInfo.value.friendId = message.sender.userId
      event.preventDefault()
    }
    onBeforeUnmount(() => {
      // 清理事件监听
      document.removeEventListener('click', hideDialog)
      if (messageContainer.value) {
        messageContainer.value.removeEventListener('scroll', handleScroll)
      }
    })


      return {
        CacheType,
        messages,
        userStore,
        messageContainer,
        contextMenuVisible,
        contextMenuPosition,
        contextMenuItems,
        currentMessage,
        handleContextMenu,
        handleMenuCommand,
        userInfo,
        showUserInfo,
      }
  },
})
</script>

<style>
.message-emoji {
  display: inline-block;
  width: 35px;
  height: 35px;
  vertical-align: middle;
  margin: 0 2px;
  user-select: none;
}

.selectable {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  cursor: text;
}

</style>

<style lang="less" scoped>
.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #F9FAFB;
  display: flex;
  flex-direction: column;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(178, 190, 195, 0.5);
    border-radius: 3px;

    &:hover {
      background-color: rgba(178, 190, 195, 0.8);
    }
  }

  .message {
    max-width: 70%;
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    animation: fadeIn 0.3s ease-out;

    &.received {
      align-self: flex-start;
    }

    &.send {
      align-self: flex-end;
      flex-direction: row-reverse;

      .message-content {
        background-color: #FF7D45;
        border-bottom-right-radius: 2px;
        margin-right: 8px;
        margin-left: 0;

        :deep(.message-text) {
          color: white;
        }
      }
    }
    &.system {
      align-self: center;
      .message-content {
        padding: 0;
        background: none;
      }
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin: 0 8px;
      background-color: #FFE6D9;
      flex-shrink: 0;
      overflow: hidden;
      cursor: pointer;

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .message-content {
      padding: 12px;
      border-radius: 12px;
      position: relative;
      background-color: #fff;
      border-bottom-left-radius: 2px;

    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
