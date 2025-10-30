import { defineStore } from 'pinia'

/**
 * @description: 视图状态管理
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
    setCurrentChat(conversationId: string) {
      this.currentChatId = conversationId
    },
  },
})
