import type { IChatHistory } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'

import { useConversationStore } from '../conversation/conversation'

/**
 * @description: 聊天消息管理
 */
export const useMessageStore = defineStore('useMessageStore', {
  state: () => ({
    /**
     * @description: 聊天记录，key为会话ID，value为消息数组（时间倒序，最新的在最后）
     */
    chatHistory: new Map<string, IChatHistory[]>(),

    /**
     * @description: 消息分页状态，key为会话ID
     */
    messagePagination: new Map<string, {
      hasMore: boolean
      isLoadingMore: boolean
      currentPage: number
      currentMaxSeq: number // 当前加载的最大消息序列号
    }>(),
  }),

  getters: {
    /**
     * @description: 获取会话的聊天记录（时间正序，最旧的在前面）
     */
    getChatHistory: state => (conversationId: string) => {
      const messages = state.chatHistory.get(conversationId) || []
      // 返回时间正序的副本（最旧的在前面）
      return [...messages].reverse()
    },

    /**
     * @description: 获取会话的消息分页状态
     */
    getMessagePagination: state => (conversationId: string) => {
      return state.messagePagination.get(conversationId) || {
        hasMore: true,
        isLoadingMore: false,
        currentPage: 1,
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
     * @description: 初始化会话的消息历史（第一页）
     */
    async init(conversationId: string) {
      // 初始化分页状态
      this.messagePagination.set(conversationId, {
        hasMore: true,
        isLoadingMore: false,
        currentPage: 1,
        currentMaxSeq: 0,
      })

      const pagination = this.messagePagination.get(conversationId)!

      const result = await electron.database.chat.getChatHistory({
        conversationId,
        page: pagination.currentPage,
        limit: 50, // 每次加载50条消息
      })

      if (result.list && result.list.length > 0) {
        // 存储消息（时间倒序，最新的在数组末尾）
        this.chatHistory.set(conversationId, result.list)

        // 更新最大序列号，用于增量同步
        pagination.currentMaxSeq = Math.max(...result.list.map(m => m.seq))

        // 判断是否还有更多数据
        pagination.hasMore = result.list.length >= 50
      }
      else {
        pagination.hasMore = false
      }
    },

    /**
     * @description: 加载更多消息历史（分页）
     */
    async loadMoreChatHistory(conversationId: string) {
      const pagination = this.messagePagination.get(conversationId)
      if (!pagination || !pagination.hasMore || pagination.isLoadingMore) {
        return
      }

      pagination.isLoadingMore = true

      try {
        pagination.currentPage += 1

        const result = await electron.database.chat.getChatHistory({
          conversationId,
          page: pagination.currentPage,
          limit: 50,
        })

        if (result.list && result.list.length > 0) {
          // 将新消息添加到现有消息的开头（因为是更早的消息）
          const existingMessages = this.chatHistory.get(conversationId) || []
          this.chatHistory.set(conversationId, [...result.list, ...existingMessages])

          // 更新最大序列号（虽然加载的是更早的消息，但可能有更新的序列号）
          const newMaxSeq = Math.max(...result.list.map(m => m.seq))
          pagination.currentMaxSeq = Math.max(pagination.currentMaxSeq, newMaxSeq)

          // 判断是否还有更多数据
          pagination.hasMore = result.list.length >= 50
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
     */
    addMessage(conversationId: string, message: IChatHistory) {
      const history = this.chatHistory.get(conversationId) || []

      // 检查消息是否已存在（通过 messageId 去重）
      const existingIndex = history.findIndex(m => m.messageId === message.messageId)
      if (existingIndex !== -1) {
        // 更新现有消息
        history[existingIndex] = message
      }
      else {
        // 添加新消息到末尾（最新的在最后）
        history.push(message)
      }

      this.chatHistory.set(conversationId, history)

      // 更新消息分页状态的最大序列号
      const pagination = this.messagePagination.get(conversationId)
      if (pagination) {
        pagination.currentMaxSeq = Math.max(pagination.currentMaxSeq, message.seq)
      }

      // 更新会话列表的最新消息预览
      this.updateConversationPreview(conversationId, message)
    },

    /**
     * @description: 更新会话的最新消息预览
     */
    updateConversationPreview(conversationId: string, message: IChatHistory) {
      const conversationStore = useConversationStore()

      // 查找现有会话
      const existingConversation = conversationStore.getConversationInfo(conversationId)
      if (existingConversation) {
        // 创建更新的会话对象，包含新的消息预览和时间
        const updatedConversation = {
          ...existingConversation,
          msg_preview: message.msg?.textMsg?.content || `${message.sender?.nickname} 发来新消息`,
          update_at: message.create_at, // 使用消息的创建时间
        }

        // 更新会话
        conversationStore.upsertConversation(updatedConversation)
      }
    },

    /**
     * @description: 清理指定会话的消息缓存
     */
    clearChatHistory(conversationId: string) {
      this.chatHistory.delete(conversationId)
      this.messagePagination.delete(conversationId)
    },
  },
})
