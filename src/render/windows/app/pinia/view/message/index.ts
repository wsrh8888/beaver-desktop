import type { IChatHistory } from 'commonModule/type/ajax/chat'
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
    /**
     * @description: 当前正在引用/回复的消息，null 表示无引用
     */
    replyingTo: null as IChatHistory | null,
    /**
     * @description: 是否处于多选模式
     */
    isMultiSelectMode: false,
    /**
     * @description: 多选模式下已选中的消息ID列表，最多 99 条
     */
    selectedMessageIds: [] as string[],
  }),

  actions: {
    /**
     * @description: 设置引用消息（null 为清除引用）
     */
    setReplyingTo(message: IChatHistory | null) {
      this.replyingTo = message
    },

    /**
     * @description: 进入多选模式，可选择预先选中一条消息
     */
    enterMultiSelect(firstMessageId?: string) {
      this.isMultiSelectMode = true
      this.selectedMessageIds = firstMessageId ? [firstMessageId] : []
    },

    /**
     * @description: 退出多选模式，清空选中状态
     */
    exitMultiSelect() {
      this.isMultiSelectMode = false
      this.selectedMessageIds = []
    },

    /**
     * @description: 切换某条消息的选中状态，超出 99 条上限时忽略
     */
    toggleMessageSelect(messageId: string) {
      const idx = this.selectedMessageIds.indexOf(messageId)
      if (idx >= 0) {
        this.selectedMessageIds.splice(idx, 1)
        if (this.selectedMessageIds.length === 0)
          this.exitMultiSelect()
      }
      else if (this.selectedMessageIds.length < 99) {
        this.selectedMessageIds.push(messageId)
      }
    },

    /**
     * @description: 设置当前会话，切换会话时自动退出多选模式
     */
    async setCurrentChat(conversationId: string) {
      const previousChatId = this.currentChatId

      // 退出多选模式
      this.exitMultiSelect()

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
