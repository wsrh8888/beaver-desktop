<template>
  <div ref="messageContainer" class="chat-messages">
    <div v-for="message in messages" :key="message.messageId" class="message" :class="{
      send: message.sender.userId === userStore.getUserId,
      system: message.sender.userId === '',
      'multi-selected': messageViewStore.isMultiSelectMode && messageViewStore.selectedMessageIds.includes(message.messageId),
    }">
      <!-- 多选复选框 -->
      <div v-if="messageViewStore.isMultiSelectMode && message.sender.userId !== ''" class="message-checkbox"
        @click.stop="messageViewStore.toggleMessageSelect(message.messageId)">
        <span
          :class="messageViewStore.selectedMessageIds.includes(message.messageId) ? 'cb-checked' : 'cb-unchecked'" />
      </div>

      <!-- 用户头像 -->
      <div v-if="message.sender.userId" class="message-avatar">
        <BeaverImage :cache-type="CacheType.USER_AVATAR" :file-name="message.sender.avatar"
          :alt="message.sender.nickName" image-class="avatar-image" />
      </div>

      <!--  -->
      <div class="message-content" @contextmenu.prevent="handleContextMenu($event, message)"
        @click="handleMessageClick($event, message)">
        <!-- 已撤回消息 -->
        <RecalledMessage v-if="message.msg.type === 10" :msg="message.msg" :sender="(message.sender as any)" />
        <!-- 文本消息组件 -->
        <TextMessage v-else-if="message.msg.type === 1" :msg="message.msg" />
        <!-- 图片消息组件 -->
        <ImageMessage v-else-if="message.msg.type === 2 && message.msg.imageMsg" :msg="message.msg" />
        <!-- 视频消息组件 -->
        <VideoMessage v-else-if="message.msg.type === 3 && message.msg.videoMsg" :msg="message.msg" />
        <!-- 文件消息组件（type=4） -->
        <FileMessage v-else-if="message.msg.type === 4 && message.msg.fileMsg" :msg="message.msg" />
        <!-- 语音消息组件（type=5，按住说话） -->
        <VoiceMessage
          v-else-if="message.msg.type === 5 && message.msg.voiceMsg"
          :msg="message.msg"
          :message-id="message.messageId"
          :is-self="message.sender.userId === userStore.getUserId"
        />
        <!-- 音频文件消息组件（type=8） -->
        <AudioFileMessage v-else-if="message.msg.type === 8" :msg="message.msg" />
        <!-- 通知消息组件（type=7） -->
        <NotificationMessage v-else-if="message.msg.type === 7 && message.msg.notificationMsg" :msg="message.msg" />
        <!-- 表情消息组件（type=6） -->
        <EmojiMessage v-else-if="message.msg.type === 6 && message.msg.emojiMsg" :msg="message.msg" />
        <!-- 音视频通话组件（type=9） -->
        <CallMessage v-else-if="message.msg.type === 9" :msg="message.msg" />
        <!-- 回复消息组件（type=11） -->
        <ReplyMessage v-else-if="message.msg.type === 11" :msg="message.msg" :sender="(message.sender as any)" />
        <!-- 合并转发消息组件（type=12） -->
        <MergedForwardMessage v-else-if="message.msg.type === 12 && message.msg.forwardMsg" :msg="message.msg" />
        <!-- Markdown 消息组件（type=13） -->
        <MarkdownMessage v-else-if="message.msg.type === 13 && message.msg.markdownMsg" :msg="message.msg" />
        <!-- 发送失败 -->
        <div
          v-if="message.sendStatus === MessageStatus.FAILED && message.sender.userId === userStore.getUserId"
          class="message-status status-failed"
          @click="retrySend(message)"
        >
          <img class="retry-icon" src="renderModule/assets/image/chat/retry.svg" alt="重试" />
          发送失败，点击重试
        </div>
      </div>
    </div>

    <!-- 右键菜单组件 -->
    <ContextMenu trigger="manual" :visible="contextMenuVisible" :menu-items="contextMenuItems"
      :position="contextMenuPosition" @update:visible="contextMenuVisible = $event"
      @command="(item) => handleMenuCommand(item, currentMessage)" />
    <!-- 转发对话框 -->
    <ForwardDialog v-model="forwardDialogVisible" :message-id="forwardMessageId" />
  </div>
</template>

<script lang="ts">
import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { CacheType } from 'commonModule/type/cache/cache'
import { MessageStatus } from 'commonModule/type/ajax/chat'
import ContextMenu from 'renderModule/components/ui/context-menu/index.vue'
import { ChatCore } from 'renderModule/core/message/index'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useGroupMemberStore } from 'renderModule/windows/app/pinia/group/group-member'
import { useMessageStore } from 'renderModule/windows/app/pinia/message/message'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ForwardDialog from './components/ForwardDialog.vue'
import { getMenuItems, MessageHandlerFactory } from './contentHandler'
import AudioFileMessage from './message/audio.vue'
import CallMessage from './message/call.vue'
import EmojiMessage from './message/emoji.vue'
import FileMessage from './message/file.vue'
import ImageMessage from './message/image.vue'
import MarkdownMessage from './message/markdown.vue'
import MergedForwardMessage from './message/merged-forward.vue'
import NotificationMessage from './message/notification.vue'
import ReplyMessage from './message/reply.vue'
import RecalledMessage from './message/recalled.vue'
import TextMessage from './message/text.vue'
import VideoMessage from './message/video.vue'
import VoiceMessage from './message/voice.vue'
import { getSelectedText, hasTextSelected } from './utils/copy'
import { MessageContentType } from './utils/data'

export default defineComponent({
  name: 'ChatContent',
  components: {
    ForwardDialog,
    BeaverImage,
    ContextMenu,
    AudioFileMessage,
    CallMessage,
    EmojiMessage,
    FileMessage,
    TextMessage,
    ImageMessage,
    MarkdownMessage,
    MergedForwardMessage,
    NotificationMessage,
    RecalledMessage,
    ReplyMessage,
    VideoMessage,
    VoiceMessage,
  },
  setup() {
    const userStore = useUserStore()
    const messageStore = useMessageStore()
    const messageViewStore = useMessageViewStore()
    const messageContainer = ref<HTMLElement | null>(null)
    // 右键菜单相关状态
    const contextMenuVisible = ref(false)
    const contextMenuPosition = ref<{ x: number, y: number } | null>(null)
    const contextMenuItems = ref<ContextMenuItem[]>([])
    const currentMessage = ref<any>(null) // 当前右键点击的消息
    const contextMenuSelectedText = ref('')
    const forwardDialogVisible = ref(false)
    const forwardMessageId = ref('')

    const messages = computed(() => {
      const currentId = messageViewStore.currentChatId
      return currentId ? messageStore.getChatHistory(currentId) : []
    })

    // 判断messageViewStore.currentChatId的值是否发生变化
    watch(() => messageViewStore.currentChatId, async (newConversationId) => {
      if (newConversationId) {
        console.log('会话切换:', newConversationId)

        // 初始化消息
        await messageStore.init(newConversationId)

        // 判断是否是群聊，如果是则初始化群成员
        const conversationStore = useConversationStore()
        const conversation = conversationStore.getConversationInfo(newConversationId)
        if (conversation && conversation.chatType === 2) {
          // 群聊：从 conversationId 提取 groupId
          const groupId = newConversationId.startsWith('group_')
            ? newConversationId.split('_').slice(1).join('_')
            : newConversationId
          const groupMemberStore = useGroupMemberStore()
          await groupMemberStore.init(groupId)
        }
      }
    })


    // 多选模式下点击消息气泡区域切换选中状态
    const handleMessageClick = (event: MouseEvent, message: any) => {
      if (messageViewStore.isMultiSelectMode && message.sender.userId !== '') {
        event.stopPropagation()
        messageViewStore.toggleMessageSelect(message.messageId)
      }
    }


    // 处理右键菜单
    const handleContextMenu = (event: MouseEvent, message: any) => {
      // 多选模式下禁用右键菜单
      if (messageViewStore.isMultiSelectMode)
        return

      event.preventDefault()
      event.stopPropagation()

      // 保存当前消息，用于菜单命令处理
      currentMessage.value = message

      // 获取消息类型
      const messageType = message.msg.type as MessageContentType

      // 检查是否有文本被选中（仅对文本消息有效），并在打开菜单时立刻保存选中内容（点击菜单项时选区可能已丢失）
      const hasSelected = messageType === MessageContentType.TEXT && hasTextSelected()
      contextMenuSelectedText.value = messageType === MessageContentType.TEXT ? getSelectedText() : ''

      // 根据消息类型获取菜单项（撤回只对自己发的消息显示）
      const isSender = message.sender.userId === userStore.getUserId
      contextMenuItems.value = getMenuItems(messageType, hasSelected, isSender)

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
      if (!message) {
        console.error('消息对象不存在')
        return
      }

      // 获取消息类型
      const messageType = message.msg.type
      if (typeof messageType !== 'number' || !(messageType in MessageContentType)) {
        console.error('无效的消息类型:', messageType)
        return
      }

      const menuMessage = contextMenuSelectedText.value
        ? { ...message, _selectedText: contextMenuSelectedText.value }
        : message

      const result = await MessageHandlerFactory.handleCommand(messageType as MessageContentType, String(item.id), menuMessage)
      // 转发命令由上层弹窗处理
      if (result === 'forward') {
        forwardMessageId.value = message.messageId
        forwardDialogVisible.value = true
      }
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

    watch(
      () => {
        const list = messages.value
        if (!list.length)
          return ''
        return list[list.length - 1].messageId
      },
      (newLastId, oldLastId) => {
        if (newLastId && newLastId !== oldLastId)
          scrollToBottom()
      },
    )

    onMounted(() => {
      scrollToBottom()
      if (messageContainer.value) {
        messageContainer.value.addEventListener('scroll', handleScroll)
      }
    })

    onBeforeUnmount(() => {
      if (messageContainer.value) {
        messageContainer.value.removeEventListener('scroll', handleScroll)
      }
    })

    const retrySend = async (message: any) => {
      if (message.sendStatus !== MessageStatus.FAILED || !message.msg) {
        return
      }

      const conversationId = message.conversationId || messageViewStore.currentChatId
      if (!conversationId) {
        return
      }

      const chatType = conversationId.startsWith('group_') ? 'group' : 'private'
      await messageStore.removeMessages(conversationId, [message.messageId])
      await ChatCore.sendMessage(conversationId, message.msg, chatType)
    }

    return {
      CacheType,
      MessageStatus,
      messages,
      userStore,
      messageViewStore,
      messageContainer,
      contextMenuVisible,
      contextMenuPosition,
      contextMenuItems,
      currentMessage,
      forwardDialogVisible,
      forwardMessageId,
      handleContextMenu,
      handleMenuCommand,
      handleMessageClick,
      retrySend,
    }
  },
})
</script>

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
        // border-bottom-right-radius: 2px;
        margin-right: 8px;
        margin-left: 0;
        color: #fff;
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

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .message-content {
      padding: 8px;
      border-radius: 12px;
      position: relative;
      background-color: #fff;
      color: #2d3436;
      // border-bottom-left-radius: 2px;

      .message-status {
        margin-top: 6px;
        font-size: 12px;

        &.status-failed {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ffeb3b;
          cursor: pointer;

          .retry-icon {
            width: 14px;
            height: 14px;
          }
        }
      }
    }

    // 多选模式复选框
    .message-checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      flex-shrink: 0;
      cursor: pointer;
      align-self: center;

      .cb-unchecked {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #B2BEC3;
        border-radius: 50%;
        background: #fff;
      }

      .cb-checked {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #FF7D45;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 2px;
          width: 5px;
          height: 8px;
          border: 2px solid #fff;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
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
