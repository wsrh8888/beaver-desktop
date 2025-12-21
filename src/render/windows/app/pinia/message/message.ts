import type { IChatHistory, IConversationInfoRes } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'

import Logger from 'renderModule/utils/logger'

import { useConversationStore } from '../conversation/conversation'
import { useMessageSenderStore } from './message-sender'

const logger = new Logger('MessageStore')
/**
 * @description: 聊天消息存储和管理
 * 核心职责：
 * 1. 消息存储：维护消息列表和分页状态
 * 2. 消息查询：提供消息查询接口
 * 3. 消息添加：处理新消息的添加和去重
 * 4. 会话更新：更新会话预览信息
 *
 * 注意：消息发送相关功能已分离到 MessageSenderStore
 */
export const useMessageStore = defineStore('useMessageStore', {
  state: () => ({
    /**
     * @description: 聊天记录，key为会话ID，value为消息数组（时间倒序，最新的在最后）
     * 存储格式：[老消息1, 老消息2, ..., 最新消息]
     */
    chatHistory: new Map<string, IChatHistory[]>(),

    /**
     * @description: 消息分页状态，key为会话ID
     */
    messagePagination: new Map<string, {
      hasMore: boolean
      isLoadingMore: boolean
      currentMinSeq: number // 当前加载的最小消息序列号（用于加载历史消息）
      currentMaxSeq: number // 当前加载的最大消息序列号（用于增量同步）
    }>(),
  }),

  getters: {
    /**
     * @description: 获取会话的聊天记录（时间倒序，最新的在最后）
     */
    getChatHistory: state => (conversationId: string) => {
      const messages = state.chatHistory.get(conversationId) || []
      // 返回时间倒序的副本（最新的在最后）
      return [...messages]
    },

    /**
     * @description: 获取会话的消息分页状态
     */
    getMessagePagination: state => (conversationId: string) => {
      return state.messagePagination.get(conversationId) || {
        hasMore: true,
        isLoadingMore: false,
        currentMinSeq: 0,
        currentMaxSeq: 0,
      }
    },

    /**
     * @description: 获取会话的最新消息
     */
    getLatestMessage: state => (conversationId: string) => {
      const messages = state.chatHistory.get(conversationId) || []
      return messages.length > 0 ? messages[messages.length - 1] : null
    },
  },

  actions: {
    /**
     * @description: 重置store状态
     */
    reset() {
      this.chatHistory.clear()
      this.messagePagination.clear()
    },

    /**
     * @description: 初始化会话的消息（智能缓存策略）
     * 大厂IM的做法：检查是否已有缓存，有缓存就复用，没有才加载
     * 这样每次点开会话时，如果已有数据就直接用，性能更好
     */
    async init(conversationId: string) {
      // 检查是否已有缓存（通过messagePagination来判断是否已初始化过）
      const existingPagination = this.messagePagination.get(conversationId)
      const existingMessages = this.chatHistory.get(conversationId)

      // 如果已有完整的缓存（分页状态 + 消息数据），说明已经初始化过了
      if (existingPagination && existingMessages && existingMessages.length > 0) {
        console.log('已经缓存过了， 使用缓存')
        return // 使用缓存，不重新加载
      }

      // 没有缓存或缓存不完整，才进行初始化加载
      this.messagePagination.set(conversationId, {
        hasMore: true,
        isLoadingMore: false,
        currentMinSeq: 0,
        currentMaxSeq: 0,
      })

      const pagination = this.messagePagination.get(conversationId)!

      // 加载最近的30条消息（大厂IM的典型做法）
      // 初始化时不传seq参数，默认加载最新的消息
      const result = await electron.database.chat.getChatHistory({
        conversationId,
        limit: 30,
      })
      console.error('cxcxcxcsdf', result, {
        conversationId,
        limit: 30,
      })

      if (result.list && result.list.length > 0) {
        // 后端返回的是时间正序的数据（最旧的在前）
        // 需要反转为时间倒序存储（最新的在数组末尾）
        const reversedList = [...result.list].reverse()
        this.chatHistory.set(conversationId, reversedList)

        // 更新序列号范围
        const seqs = result.list.map(m => m.seq)
        pagination.currentMinSeq = Math.min(...seqs)
        pagination.currentMaxSeq = Math.max(...seqs)

        // 如果返回的消息数量等于请求数量，说明可能还有更多历史消息
        pagination.hasMore = result.list.length >= 30
      }
      else {
        pagination.hasMore = false
      }
    },

    /**
     * @description: 加载更多消息历史（当用户滑动到顶部时调用）
     * 大厂IM的做法：加载比当前最小seq更小的消息，添加到现有消息的前面
     */
    async loadMoreChatHistory(conversationId: string) {
      const pagination = this.messagePagination.get(conversationId)
      if (!pagination || !pagination.hasMore || pagination.isLoadingMore) {
        return
      }

      pagination.isLoadingMore = true

      try {
        // 加载比当前最小seq更小的消息（更早的历史消息）
        // 使用seq参数，加载这个seq之前的消息
        const result = await electron.database.chat.getChatHistory({
          conversationId,
          seq: pagination.currentMinSeq, // 加载比当前最小seq更小的消息
          limit: 30, // 每次加载30条历史消息
        })

        if (result.list && result.list.length > 0) {
          // 后端返回的是时间正序的数据（最旧的在前）
          // 需要反转后添加到现有消息的前面，保持整体时间倒序
          const reversedList = [...result.list].reverse()
          const existingMessages = this.chatHistory.get(conversationId) || []
          this.chatHistory.set(conversationId, [...reversedList, ...existingMessages])

          // 更新最小序列号
          const newMinSeq = Math.min(...result.list.map(m => m.seq))
          pagination.currentMinSeq = Math.min(pagination.currentMinSeq, newMinSeq)

          // 如果返回的消息数量等于请求数量，说明可能还有更多历史消息
          pagination.hasMore = result.list.length >= 30
        }
        else {
          pagination.hasMore = false
        }
      }
      finally {
        pagination.isLoadingMore = false
      }
    },

    /**
     * @description: 添加新消息（实时接收或发送成功）
     * 优先通过 messageId 去重（用于发送确认），其次通过 seq 去重
     * 使用 seq 进行排序，保证消息顺序的绝对正确性
     */
    addMessage(conversationId: string, message: IChatHistory) {
      console.log('增加了消息', conversationId, message)
      const history = this.chatHistory.get(conversationId) || []

      // 优先通过 messageId 去重（用于发送消息的本地创建和服务器确认）
      let existingIndex = history.findIndex(m => m.messageId === message.messageId)
      if (existingIndex !== -1) {
        // 找到相同messageId的消息，更新它（通常是发送确认时更新seq和状态）
        const oldMessage = history[existingIndex]
        history[existingIndex] = { ...oldMessage, ...message }
        console.log(`[MessageStore] 通过messageId更新消息: ${message.messageId}`)

        // 如果消息是从服务器拉取到的（有sendStatus字段），说明状态已确认，清理发送状态
        if (message.sendStatus) {
          // 延迟清理，避免立即清理导致的问题
          setTimeout(() => {
            const messageSenderStore = useMessageSenderStore()
            messageSenderStore.cleanupMessageStatus(message.messageId)
          }, 100)
        }

        return
      }

      // 如果没有找到相同messageId，再通过seq去重（正常的消息接收）
      existingIndex = history.findIndex(m => m.seq === message.seq)
      if (existingIndex !== -1) {
        // seq 重复是严重错误，但为了健壮性，我们更新消息
        history.push(message)
      }
      else {
        history.push(message)
      }

      this.chatHistory.set(conversationId, history)

      // 更新消息分页状态的序列号范围
      const pagination = this.messagePagination.get(conversationId)
      if (pagination) {
        pagination.currentMaxSeq = Math.max(pagination.currentMaxSeq, message.seq)
        // 如果是历史消息（seq比当前最小值还小），更新最小seq
        if (pagination.currentMinSeq === 0 || message.seq < pagination.currentMinSeq) {
          pagination.currentMinSeq = message.seq
        }
      }

      // 更新会话列表的最新消息预览
      this.updateConversationPreview(conversationId, message)
    },

    /**
     * @description: 根据seq范围拉取消息数据（用于处理后台推送通知）
     * 大厂IM的做法：收到推送后主动拉取数据，避免推送大量数据
     */
    async fetchMessagesBySeqRange(conversationId: string, minSeq: number, maxSeq: number) {
      try {
        logger.info({
          text: '开始拉取消息数据',
          data: { conversationId, minSeq, maxSeq },
        })
        // 调用后端API获取指定seq之后的消息（增量同步）
        // 由于当前API设计是加载比seq更小的消息，我们需要反向思考
        // 这里暂时保持原逻辑，后续可以考虑扩展API支持afterSeq参数
        const result = await electron.database.chat.getChatHistory({
          conversationId,
          limit: maxSeq - minSeq + 1, // 加载指定范围的消息
        })
        logger.info({
          text: '拉取消息数据',
          data: result,
        })

        if (result && result.list && result.list.length > 0) {
          // 将消息添加到store中
          for (const message of result.list) {
            this.addMessage(conversationId, message)
          }

          // 更新分页状态的最大序列号
          const pagination = this.messagePagination.get(conversationId)
          if (pagination) {
            pagination.currentMaxSeq = Math.max(pagination.currentMaxSeq, maxSeq)
          }
        }
      }
      catch (error) {
        console.error('拉取消息数据失败:', error)
        throw error
      }
    },

    /**
     * @description: 更新会话的最新消息预览
     */
    updateConversationPreview(conversationId: string, message: IChatHistory) {
      const conversationStore = useConversationStore()

      // 查找现有会话
      const existingConversation = conversationStore.getConversationInfo(conversationId)
      if (existingConversation) {
        // 获取消息的时间戳（用于排序和格式化）
        const messageTimestamp = message.created_at ? new Date(message.created_at).getTime() : Date.now()
        // 转换为秒级时间戳（与数据库保持一致）
        const messageTimestampSeconds = Math.floor(messageTimestamp / 1000)

        // 创建更新的会话对象，包含新的消息预览和时间戳
        const updatedConversation: IConversationInfoRes = {
          ...existingConversation,
          msgPreview: message.msg?.textMsg?.content || `${message.sender?.nickName} 发来新消息`,
          updatedAt: messageTimestampSeconds, // 保存原始时间戳（秒级），前端 getter 会格式化
        }

        // 更新会话
        conversationStore.upsertConversation(updatedConversation)
      }
    },

  },
})
