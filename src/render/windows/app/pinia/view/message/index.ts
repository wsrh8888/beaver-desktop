import { defineStore } from 'pinia'
import { useConversationStore } from '../../conversation/conversation'

/**
 * @description: 消息视图状态管理
 * 只负责当前会话ID的管理，已读逻辑委托给conversation store
 */
export const useMessageViewStore = defineStore('useMessageViewStore', {
  state: () => ({
    /**
     * @description: 当前选中的会话ID
     */
    currentChatId: null as string | null,
  }),

  actions: {
    /**
     * @description: 设置当前会话
     */
    async setCurrentChat(conversationId: string) {
      const previousChatId = this.currentChatId

      // 更新当前会话ID
      this.currentChatId = conversationId
      // 如果切换到了不同的会话，才标记已读
      if (previousChatId !== conversationId) {
        // 委托给conversation store处理已读逻辑
        const conversationStore = useConversationStore()
        await conversationStore.markConversationAsRead(conversationId)
      }
    },
  }
})
