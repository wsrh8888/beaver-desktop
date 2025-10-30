import type { IChatHistory } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'

import { getChatHistoryApi } from 'renderModule/api/chat'
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'

/**
 * @description: 聊天消息管理
 */
export const useChatStore = defineStore('useChatStore', {
  state: () => ({
    /**
     * @description: 聊天记录缓存，key为会话ID
     */
    chatHistory: new Map<string, IChatHistory[]>(),

    /**
     * @description: 消息缓存，用于优化加载性能
     * @param timestamp - 缓存时间戳
     * @param messages - 缓存的消息列表
     */
    messageCache: new Map<string, {
      timestamp: number
      messages: IChatHistory[]
    }>(),

    /**
     * @description: 消息加载状态，用于控制加载动画
     */
    loadingStates: new Map<string, boolean>(),

    /**
     * @description: 是否还有更多消息，用于控制加载更多
     */
    hasMoreMessages: new Map<string, boolean>(),

  }),

  getters: {
    /**
     * @description: 获取会话的聊天记录
     */
    getChatHistory: state => (conversationId: string) =>
      state.chatHistory.get(conversationId) || [],
  },

  actions: {
    /**
     * @description: 重置store状态
     */
    reset() {
      this.chatHistory.clear()
      this.messageCache.clear()
      this.loadingStates.clear()
      this.hasMoreMessages.clear()
    },

    /**
     * @description: 加载聊天记录
     * @param {string} conversationId - 会话ID
     * @param {boolean} useCache - 是否使用缓存
     */
    async loadChatHistory(conversationId: string, useCache: boolean = true) {
      const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

      if (useCache) {
        const cached = this.messageCache.get(conversationId)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          this.chatHistory.set(conversationId, cached.messages)
          return
        }
      }

      try {
        this.loadingStates.set(conversationId, true)
        const res = await getChatHistoryApi({ conversationId })

        if (res.code === 0) {
          const messages = res.result.list || []
          console.error('聊天记录:', messages)
          // 直接使用原始数据，不需要特殊处理

          // 消息按时间倒序排列，最新的在前面
          this.chatHistory.set(conversationId, messages.reverse())
          console.error(messages.reverse(), 'messages.reverse()')
          this.messageCache.set(conversationId, {
            timestamp: Date.now(),
            messages: messages.reverse(),
          })
          this.hasMoreMessages.set(conversationId, messages.length >= 20)
        }
      }
      catch (error) {
        console.error('Failed to load chat history:', error)
        throw error
      }
      finally {
        this.loadingStates.set(conversationId, false)
      }
    },

    /**
     * @description: 添加新消息
     * @param {string} conversationId - 会话ID
     * @param {IChatHistory} message - 消息内容
     */
    addMessage(conversationId: string, message: IChatHistory) {
      console.error('添加新消息:', conversationId, message)

      const history = this.chatHistory.get(conversationId) || []
      // 新消息添加到开头
      history.push(message)
      this.chatHistory.set(conversationId, history)

      // 更新会话列表的最新消息
      const conversationStore = useConversationStore()
      conversationStore.updateLastMessage(conversationId, {
        content: message.msg.textMsg?.content || '',
        timestamp: message.create_at,
      })
    },
  },
})
