import { defineStore } from 'pinia'
import type { IChatHistory, MessageStatus } from 'commonModule/type/ajax/chat'
import { MessageType } from 'commonModule/type/ajax/chat'
import Logger from 'renderModule/utils/logger'
import chatSender from '../../message-manager/senders/chat-sender'
import { MessageFactory } from '../../message-manager/message-factory'
import { MessageParser } from '../../message-manager/message-parser'
import { useUserStore } from '../user/user'
import { useMessageStore } from './message'
import { useMessageViewStore } from '../view/message/index'
import { useConversationStore } from '../conversation/conversation'

const logger = new Logger('MessageSenderStore')

/**
 * @description: 消息发送管理
 * 遵循管道化架构: 
 * 1. 采集 (UI/API) -> 
 * 2. 转换 (Parser/Factory) -> 
 * 3. 预处理 (Local Persistence) -> 
 * 4. 传输 (WebSocket) -> 
 * 5. 确认 (Ack/Status)
 */
export const useMessageSenderStore = defineStore('useMessageSenderStore', {
  state: () => ({
    messageSendStatus: new Map<string, {
      status: MessageStatus
      conversationId: string
      timeoutId?: NodeJS.Timeout
      retryCount: number
      timestamp: number
      errorMessage?: string
    }>(),
  }),

  getters: {
    getMessageSendStatus: state => (messageId: string) => {
      return state.messageSendStatus.get(messageId)
    },
  },

  actions: {


    /**
     * @description: 发送混合内容 (从 DOM 提取)
     */
    async sendMixedContent(editorElement: HTMLElement) {
      const viewStore = useMessageViewStore()
      const conversationId = viewStore.currentChatId
      if (!conversationId) return

      const parts = MessageParser.parseFromEditor(editorElement)

      // 顺序发送各个分块
      let isFirstPart = true
      for (const part of parts) {
        const msgType = MessageParser.mapPartToType(part.type)
        const replyingTo = (isFirstPart && viewStore.replyingTo) ? viewStore.replyingTo : undefined

        await this.sendMessage(part.content, msgType, replyingTo)

        if (isFirstPart && viewStore.replyingTo) {
          viewStore.setReplyingTo(null)
        }
        isFirstPart = false
      }

      viewStore.clearDraft(conversationId)
    },

    /**
     * @description: 核心调度: 执行发送流水线
     */
    async sendMessage(
      content: any,
      messageType: MessageType,
      replyTo?: IChatHistory | null,
    ) {
      const userStore = useUserStore()
      const messageStore = useMessageStore()
      const viewStore = useMessageViewStore()
      const conversationStore = useConversationStore()

      const conversationId = viewStore.currentChatId
      if (!conversationId) return

      // --- 1. 准备阶段 (Metadata) ---
      const conversationInfo = conversationStore.getConversationInfo(conversationId)
      const chatType = conversationInfo?.chatType === 2 ? 'group' : 'private'
      const userId = userStore.getUserId
      const userInfo = {
        avatar: userStore.getUserInfo.avatar,
        nickName: userStore.getUserInfo.nickName
      }
      const messageId = MessageFactory.generateMessageId(userId)

      try {
        // --- 2. 转换阶段 (Models) ---
        const msgModel = MessageFactory.buildLocalMessage(content, messageType, replyTo)
        const localMessage = MessageFactory.buildHistoryItem(userId, userInfo, conversationId, messageId, msgModel)

        // --- 3. 预占位 (UI Feedback) ---
        messageStore.addMessage(conversationId, localMessage)
        this.trackMessageState(messageId, conversationId)

        // --- 4. 传输阶段 (IO) ---
        const sendBody = MessageFactory.buildChatMessageBody(conversationId, messageId, msgModel, chatType)
        await chatSender.sendToWs(sendBody)

        logger.info({ text: `消息已投递: ${messageId}` })
      }
      catch (error) {
        logger.error({ text: '发送失败', data: { messageId, error: (error as Error).message } })
        this.failMessage(messageId, (error as Error).message)
        throw error
      }
    },

    /**
     * @description: 追踪消息发送状态与超时
     */
    trackMessageState(messageId: string, conversationId: string, timeoutMs: number = 10000) {
      const timeoutId = setTimeout(() => {
        this.handleMessageTimeout(messageId)
      }, timeoutMs)

      this.messageSendStatus.set(messageId, {
        status: 0,
        conversationId,
        retryCount: 0,
        timestamp: Date.now(),
        timeoutId
      })
    },

    failMessage(messageId: string, errorMessage?: string) {
      const status = this.messageSendStatus.get(messageId)
      if (!status) return

      if (status.timeoutId) clearTimeout(status.timeoutId)
      status.status = 2
      status.errorMessage = errorMessage

      // 更新列表中的状态
      const messageStore = useMessageStore()
      const messages = messageStore.chatHistory.get(status.conversationId) || []
      const message = messages.find(m => m.messageId === messageId)
      if (message) message.sendStatus = 2
    },

    handleMessageTimeout(messageId: string) {
      const status = this.messageSendStatus.get(messageId)
      if (!status || status.status !== 0) return
      this.failMessage(messageId, '发送超时')
    },

    cleanupMessageStatus(messageId: string) {
      const status = this.messageSendStatus.get(messageId)
      if (status) {
        if (status.timeoutId) clearTimeout(status.timeoutId)
        this.messageSendStatus.delete(messageId)
      }
    },
  },
})
