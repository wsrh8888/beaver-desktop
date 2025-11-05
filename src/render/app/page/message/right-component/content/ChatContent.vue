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
      <div class="message-content" @contextmenu.prevent="showCustomContextMenu($event)">
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

    <!-- 自定义右键菜单 -->
    <div v-show="showMenu" class="custom-context-menu" :style="menuPosition">
      <div v-show="copyShow" class="menu-item" @click="copySelectedText">
        复制
      </div>
      <div v-for="item in menuList" v-show="!copyShow" :key="item.id" class="menu-item">
        <div>{{ item.name }}</div>
      </div>
    </div>
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
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import userInfo from './userInfo.vue'

export default defineComponent({
  components: {
    UserInfo: userInfo,
    BeaverImage,
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
    const copyShow = ref(true)
    // 右键菜单相关状态
    const showMenu = ref(false)
    const menuPosition = ref({ top: '0px', left: '0px' })

    const messages = computed(() => {
      const currentId = messageViewStore.currentChatId
      return currentId ? messageStore.getChatHistory(currentId) : []
    })

    // 判断messageViewStore.currentChatId的值是否发生变化
    watch(() => messageViewStore.currentChatId, () => {
      if (messageViewStore.currentChatId) {
        messageStore.init(messageViewStore.currentChatId)
      }
    })

    const menuList = ref([
      { id: 1, name: '复制' },
    ])

    // 计算图片尺寸
    const calculateImageSize = (originalWidth: number, originalHeight: number) => {
      // 设置最大宽度和最大高度限制
      const maxWidth = 240 // 最大宽度240px
      const maxHeight = 300 // 最大高度300px

      console.log('原始尺寸:', originalWidth, 'x', originalHeight, '比例:', (originalWidth / originalHeight).toFixed(2))
      console.log('最大限制:', maxWidth, 'x', maxHeight)

      // 如果图片的宽度和高度都小于最大限制，直接使用原始尺寸
      if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
        console.log('图片尺寸在限制范围内，使用原始尺寸')
        return {
          width: originalWidth,
          height: originalHeight,
        }
      }

      // 计算宽度和高度的缩放比例
      const widthRatio = maxWidth / originalWidth
      const heightRatio = maxHeight / originalHeight

      // 选择较小的缩放比例，确保图片完全适应限制，同时保持宽高比
      const scaleRatio = Math.min(widthRatio, heightRatio)

      const newWidth = originalWidth * scaleRatio
      const newHeight = originalHeight * scaleRatio

      console.log('缩放比例:', '宽度比例:', widthRatio.toFixed(3), '高度比例:', heightRatio.toFixed(3), '使用比例:', scaleRatio.toFixed(3))
      console.log('缩放后尺寸:', newWidth.toFixed(1), 'x', newHeight.toFixed(1), '比例:', (newWidth / newHeight).toFixed(2))

      return {
        width: newWidth,
        height: newHeight,
      }
    }

    // 计算图片尺寸（从消息数据中获取）
    const getImageSize = (message: any) => {
      if (message.msg.type === 2 && message.msg.imageMsg) {
        const { width, height } = message.msg.imageMsg
        if (width && height) {
          console.log('计算图片尺寸', message.msg.imageMsg.fileName, calculateImageSize(width, height))
          return calculateImageSize(width, height)
        }
      }
      console.log('没有找到图片尺寸信息，使用默认值')
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

    // 显示自定义右键菜单
    const showCustomContextMenu = (event: MouseEvent) => {
      const selection = window.getSelection()
      console.log(selection, 'selection')
      if (selection && selection.toString().trim().length > 0) {
        // 只有当有文本被选中时才显示右键菜单
        console.log(selection, 'text')
        showMenu.value = true
        menuPosition.value = {
          top: `${event.clientY}px`,
          left: `${event.clientX}px`,
        }
        copyShow.value = true
        // 阻止默认的右键菜单
        event.preventDefault()
      }
      else {
        console.log('menu')
        showMenu.value = true
        menuPosition.value = {
          top: `${event.clientY}px`,
          left: `${event.clientX}px`,
        }
        copyShow.value = false
        event.preventDefault()
      }
    }

    // 复制选中文本
    const copySelectedText = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim().length > 0) {
        try {
          // 尝试使用现代剪贴板API
          navigator.clipboard.writeText(selection.toString())
            .then(() => {
              showMenu.value = false
            })
            .catch((err) => {
              console.error('复制失败:', err)
              // 回退到传统方法
              fallbackCopy(selection.toString())
            })
        }
        catch {
          // 如果不支持clipboard API，使用传统方法
          fallbackCopy(selection.toString())
        }
      }

      showMenu.value = false
    }

    // 传统复制方法（备用）
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed' // 避免滚动到底部
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
      }
      catch (err) {
        console.error('复制失败:', err)
      }

      document.body.removeChild(textArea)
    }

    // 点击其他地方时隐藏右键菜单
    const hideDialog = (e: MouseEvent) => {
      console.log('hide', e)

      showMenu.value = false
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
      document.addEventListener('contextmenu', (e) => {
        // 允许在非自定义区域使用默认右键菜单
        if (!e.target || !(e.target as HTMLElement).closest('.message-text')) {
          showMenu.value = false
        }
      })
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
      showMenu,
      menuPosition,
      showCustomContextMenu,
      copySelectedText,
      copyShow,
      menuList,
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

.custom-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  min-width: 80px;
  z-index: 9999;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #2D3436;
}

.menu-item:hover {
  background-color: #F9FAFB;
  color: #FF7D45;
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
