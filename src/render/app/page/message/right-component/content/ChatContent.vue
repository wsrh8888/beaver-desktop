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
        <div
          v-if="message.msg.type === 1" class="message-text selectable"
          v-html="formatMessageWithEmojis(message.msg.textMsg?.content)"
        />
        <div v-else-if="message.msg.type === 2 && message.msg.imageMsg" class="message-image">
          <div :style="{ width: `${getImageSize(message).width}px`, height: `${getImageSize(message).height}px` }">
            <BeaverImage
              :file-name="message.msg.imageMsg.fileName" alt="图片"
              image-class="message-image-content" @click="handleImageClick(message.msg.imageMsg.fileName)"
            />
          </div>
        </div>

        <!-- 发送状态指示器 -->
        <div v-if="message.sendStatus !== undefined && message.sender.userId === userStore.userInfo.userId" class="message-status">
          <div v-if="message.sendStatus === 0" class="status-sending">
            <div class="sending-spinner" />
            发送中...
          </div>
          <div v-else-if="message.sendStatus === 2" class="status-failed" @click="retrySend(message)">
            <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            发送失败，点击重试
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单组件 -->
    <ContextMenu
      ref="contextMenuRef"
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
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useMessageStore } from 'renderModule/app/pinia/message/message'
import { useMessageSenderStore } from 'renderModule/app/pinia/message/message-sender'
import { useUserStore } from 'renderModule/app/pinia/user/user'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import { emojiMap } from 'renderModule/app/utils/emoji'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import ContextMenu from 'renderModule/components/ui/context-menu/index.vue'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import userInfo from './userInfo.vue'
import { getMenuItems, MessageContentType } from './data'
import { copyToClipboard, hasTextSelected } from './copy'
import { calculateImageSize } from 'renderModule/utils/image/index'
import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'

export default defineComponent({
  components: {
    UserInfo: userInfo,
    BeaverImage,
    ContextMenu,
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
    const messageSenderStore = useMessageSenderStore()

    const conversationStore = useConversationStore()
    const messageViewStore = useMessageViewStore()
    const messageContainer = ref<HTMLElement | null>(null)
    // 右键菜单相关状态
    const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
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


    // 计算图片尺寸（从消息数据中获取）
    const getImageSize = (message: any) => {
      if (message.msg.type === 2 && message.msg.imageMsg) {
        const { width, height } = message.msg.imageMsg
        if (width && height) {
          return calculateImageSize(width, height)
        }
      }
      // 如果没有尺寸信息，返回默认值
      return { width: 200, height: 200 }
    }

    // 将文本中的表情符号替换为图片
    const formatMessageWithEmojis = (text: string | undefined) => {
      if (!text)
        return ''

      // 使用正则表达式匹配 [xxx] 格式的表情
      return text.replace(/\[[^\]]+\]/g, (match) => {
        const emojiUrl = emojiMap(match)
        if (emojiUrl) {
          return `<img src="${emojiUrl}" alt="${match}" class="message-emoji" draggable="false" />`
        }
        return match
      })
    }

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

    const handleImageClick = (_fileName: string) => {
      console.log('图片预览功能开发中')
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

    // 移除 previewOnlineFile 函数，因为现在使用 BeaverImage 组件
    // 重发消息
    const retrySend = async (message: any) => {
      if (!message.messageId || message.sendStatus !== 2) {
        return
      }

      try {
        // 使用messageSenderStore重发消息
        await messageSenderStore.retrySendMessage(message.messageId)
      }
      catch (error) {
        console.error('重发消息失败:', error)
      }
    }

    return {
      CacheType,
      messages,
      userStore,
      conversationStore,
      messageContainer,
      handleImageClick,
      formatMessageWithEmojis,
      contextMenuRef,
      contextMenuVisible,
      contextMenuPosition,
      contextMenuItems,
      currentMessage,
      handleContextMenu,
      handleMenuCommand,
      userInfo,
      showUserInfo,
      getImageSize,
      retrySend,
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

        .message-text {
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

      .message-text {
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
        color: #2D3436;
      }

      .message-status {
        margin-top: 4px;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .status-sending {
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;

          .sending-spinner {
            width: 12px;
            height: 12px;
            border: 1px solid #ddd;
            border-top: 1px solid #FF7D45;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        }

        .status-failed {
          color: #ff4d4f;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;

          &:hover {
            opacity: 0.8;
          }

          .retry-icon {
            width: 12px;
            height: 12px;
          }
        }
      }

      .message-image {
        max-width: 240px;
        border-radius: 8px;
        overflow: hidden;

        .message-image-content {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }
      }
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
