import type { IChatHistory, IMessage, MessageStatus } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { MessageType } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'

import Logger from 'renderModule/utils/logger'
import chatSender from '../../message-manager/senders/chat-sender'
import { useUserStore } from '../user/user'
import { useMessageStore } from './message'

const logger = new Logger('MessageSenderStore')

/**
 * @description: 消息发送管理
 * 核心职责：
 * 1. 消息发送：统一的发送入口
 * 2. 发送状态管理：跟踪发送状态、超时、重发
 * 3. 发送确认：处理发送成功确认
 */
export const useMessageSenderStore = defineStore('useMessageSenderStore', {
  state: () => ({
    /**
     * @description: 消息发送状态管理，key为messageId
     */
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
    /**
     * @description: 获取消息发送状态
     */
    getMessageSendStatus: state => (messageId: string) => {
      return state.messageSendStatus.get(messageId)
    },
  },

  actions: {
    /**
     * @description: 构建消息内容对象
     */
    buildMessageContent(content: any, messageType: MessageType): IMessage {
      return this.buildMessageContentInternal(content, messageType)
    },

    /**
     * @description: 构建消息内容对象（内部方法）
     */
    buildMessageContentInternal(content: any, messageType: MessageType): IMessage {
      switch (messageType) {
        case MessageType.TEXT:
          return {
            type: MessageType.TEXT,
            textMsg: { content },
          }
        case MessageType.IMAGE:
          return {
            type: MessageType.IMAGE,
            imageMsg: content,
          }
        case MessageType.VIDEO:
          return {
            type: MessageType.VIDEO,
            videoMsg: content,
          }
        case MessageType.FILE:
          return {
            type: MessageType.FILE,
            fileMsg: content,
          }
        case MessageType.VOICE:
          return {
            type: MessageType.VOICE,
            voiceMsg: content,
          }
        case MessageType.AUDIO_FILE:
          return {
            type: MessageType.AUDIO_FILE,
            audioFileMsg: content,
          }
        default:
          return {
            type: MessageType.TEXT,
            textMsg: { content: String(content) },
          }
      }
    },

    /**
     * @description: 将IMessage转换为IMessageMsg格式（用于WebSocket传输）
     */
    convertToWsMessageFormat(message: IMessage): IMessageMsg {
      switch (message.type) {
        case MessageType.TEXT:
          return {
            type: MessageType.TEXT,
            textMsg: message.textMsg ? { content: message.textMsg.content } : undefined,
            imageMsg: null,
            videoMsg: null,
            fileMsg: null,
            voiceMsg: null,
            emojiMsg: null,
            replyMsg: null,
          }
        case MessageType.IMAGE:
          return {
            type: MessageType.IMAGE,
            imageMsg: message.imageMsg,
          }
        case MessageType.VIDEO:
          return {
            type: MessageType.VIDEO,
            videoMsg: message.videoMsg,
          }
        case MessageType.FILE:
          return {
            type: MessageType.FILE,
            fileMsg: message.fileMsg,
          }
        case MessageType.VOICE:
          return {
            type: MessageType.VOICE,
            voiceMsg: message.voiceMsg,
          }
        case MessageType.AUDIO_FILE:
          return {
            type: MessageType.AUDIO_FILE,
            audioFileMsg: message.audioFileMsg,
          }
        default:
          return {
            type: MessageType.TEXT,
            textMsg: { content: String(message) },
          }
      }
    },

    /**
     * @description: 发送消息（统一的发送入口）
     */
    async sendMessage(
      conversationId: string,
      content: any,
      messageType: MessageType,
      chatType: string,
    ) {
      try {
        // 1. 调用发送器发送消息，获取messageId
        const messageId = await chatSender.sendMessage(conversationId, content, messageType, chatType)

        // 2. 获取用户信息和消息store
        const userStore = useUserStore()
        const messageStore = useMessageStore()

        // 3. 创建本地消息对象
        const localMessage: IChatHistory = {
          id: 0, // 临时ID，发送成功后会更新
          messageId,
          conversationId,
          seq: 0, // 临时seq，发送成功后会更新
          msg: this.buildMessageContent(content, messageType),
          sender: {
            userId: userStore.userInfo.userId,
            avatar: userStore.userInfo.avatar,
            nickname: userStore.userInfo.nickName,
          },
          create_at: new Date().toISOString(),
          status: 1, // 正常状态
          sendStatus: 0, // 发送中状态
        }

        // 4. 添加到消息列表显示
        messageStore.addMessage(conversationId, localMessage)

        // 5. 开始发送状态跟踪
        this.startSendingMessage(messageId, conversationId)

        // 6. 更新会话预览
        messageStore.updateConversationPreview(conversationId, localMessage)

        logger.info({ text: `消息发送成功: ${messageId}` })
      }
      catch (error) {
        logger.error({ text: '发送消息失败', data: { error: (error as Error).message } })
        throw error
      }
    },

    /**
     * @description: 开始发送消息，设置发送状态
     */
    startSendingMessage(messageId: string, conversationId: string, timeoutMs: number = 10000) {
      // 设置发送状态为sending
      this.messageSendStatus.set(messageId, {
        status: 0,
        conversationId,
        retryCount: 0,
        timestamp: Date.now(),
      })

      // 设置超时定时器
      const timeoutId = setTimeout(() => {
        this.handleMessageTimeout(messageId)
      }, timeoutMs)

      // 保存timeoutId
      const status = this.messageSendStatus.get(messageId)
      if (status) {
        status.timeoutId = timeoutId
      }

      logger.info({ text: `开始发送消息: ${messageId}` })
    },

    /**
     * @description: 消息发送失败
     */
    failMessage(messageId: string, errorMessage?: string) {
      const status = this.messageSendStatus.get(messageId)
      if (!status) {
        logger.warn({ text: `未找到消息发送状态: ${messageId}` })
        return
      }

      // 清除超时定时器
      if (status.timeoutId) {
        clearTimeout(status.timeoutId)
      }

      // 更新状态为失败
      status.status = 2
      status.errorMessage = errorMessage

      // 更新消息的发送状态
      const messageStore = useMessageStore()
      const messages = messageStore.chatHistory.get(status.conversationId) || []
      const message = messages.find(m => m.messageId === messageId)
      if (message) {
        message.sendStatus = 2
      }

      logger.info({ text: `消息发送失败: ${messageId}, 错误: ${errorMessage}` })
    },

    /**
     * @description: 处理消息发送超时
     */
    handleMessageTimeout(messageId: string) {
      const status = this.messageSendStatus.get(messageId)
      if (!status || status.status !== 0) {
        return
      }

      logger.warn({ text: `消息发送超时: ${messageId}` })
      this.failMessage(messageId, '发送超时')
    },

    /**
     * @description: 重发消息
     */
    async retrySendMessage(messageId: string) {
      const status = this.messageSendStatus.get(messageId)
      if (!status) {
        logger.warn({ text: `未找到消息状态，无法重发: ${messageId}` })
        return
      }

      // 检查重发次数
      if (status.retryCount >= 3) {
        logger.warn({ text: `消息重发次数过多，停止重发: ${messageId}` })
        return
      }

      // 增加重发次数
      status.retryCount++

      // 重置状态为发送中
      status.status = 0
      status.timestamp = Date.now()
      status.errorMessage = undefined

      // 重新设置超时定时器
      if (status.timeoutId) {
        clearTimeout(status.timeoutId)
      }
      status.timeoutId = setTimeout(() => {
        this.handleMessageTimeout(messageId)
      }, 10000)

      // 更新消息状态
      const messageStore = useMessageStore()
      const messages = messageStore.chatHistory.get(status.conversationId) || []
      const message = messages.find(m => m.messageId === messageId)
      if (message) {
        message.sendStatus = 0
      }

      logger.info({ text: `重发消息: ${messageId}, 重发次数: ${status.retryCount}` })
    },

    /**
     * @description: 清理指定消息的发送状态（状态确认后立即清理）
     */
    cleanupMessageStatus(messageId: string) {
      const status = this.messageSendStatus.get(messageId)
      if (status) {
        // 清除超时定时器
        if (status.timeoutId) {
          clearTimeout(status.timeoutId)
        }

        // 删除发送状态
        this.messageSendStatus.delete(messageId)
        logger.info({ text: `清理消息发送状态: ${messageId}` })
      }
    },
  },
})
