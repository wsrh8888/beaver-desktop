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
    /**
     * @description: 是否显示表情面板
     */
    showEmoji: false,
    /**
     * @description: 聊天输入框高度
     */
    inputHeight: 151,
    /**
     * @description: 各个会话的草稿内容 (HTML + 回复状态)
     */
    drafts: new Map<string, {
      html: string
      replyingTo: IChatHistory | null
    }>(),
  }),

  actions: {
    /**
     * @description: 获取指定会话的草稿
     */
    getDraft(conversationId: string) {
      return this.drafts.get(conversationId) || { html: '', replyingTo: null }
    },

    /**
     * @description: 更新当前会话的草稿 (由编辑器静默调用)
     */
    updateDraft(conversationId: string, content: { html?: string, replyingTo?: IChatHistory | null }) {
      const current = this.getDraft(conversationId)
      this.drafts.set(conversationId, {
        html: content.html !== undefined ? content.html : current.html,
        replyingTo: content.replyingTo !== undefined ? content.replyingTo : current.replyingTo,
      })

      // 同时更新当前显示的回复状态 (如果就是当前会话)
      if (conversationId === this.currentChatId) {
        if (content.replyingTo !== undefined)
          this.replyingTo = content.replyingTo
      }
    },

    /**
     * @description: 向当前草稿追加媒体内容 (供外部组件直接调用)
     */
    appendMediaToDraft(data: { type: string, fileKey: string, info: any, localUrl?: string }) {
      if (!this.currentChatId) return

      const imgHtml = `<img src="${data.localUrl || ''}" data-file-key="${data.fileKey}" data-type="${data.type}" data-info='${JSON.stringify(data.info)}' class="editor-media-node" contenteditable="false">`

      this.updateDraft(this.currentChatId, {
        html: this.getDraft(this.currentChatId).html + imgHtml
      })
    },

    /**
     * @description: 向当前草稿追加文本 (供外部组件调用)
     */
    appendTextToDraft(text: string) {
      if (!this.currentChatId) return
      this.updateDraft(this.currentChatId, {
        html: this.getDraft(this.currentChatId).html + text
      })
    },

    /**
     * @description: 清除当前会话的草稿
     */
    clearDraft(conversationId: string) {
      this.drafts.delete(conversationId)
      if (conversationId === this.currentChatId) {
        this.replyingTo = null
      }
    },

    /**
     * @description: 设置表情面板显示状态
     */
    setEmojiShow(show: boolean) {
      this.showEmoji = show
    },

    /**
     * @description: 设置输入框高度
     */
    setInputHeight(height: number) {
      this.inputHeight = height
    },

    /**
     * @description: 设置引用消息（同步更新草稿）
     */
    setReplyingTo(message: IChatHistory | null) {
      this.replyingTo = message
      if (this.currentChatId) {
        this.updateDraft(this.currentChatId, { replyingTo: message })
      }
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
     * @description: 设置当前会话，自动同步草稿状态
     */
    async setCurrentChat(conversationId: string) {
      if (this.currentChatId === conversationId) return

      // 退出多选模式
      this.exitMultiSelect()

      // 更新当前会话前，可以先根据新会话恢复 UI 状态 (由组件处理)
      const draft = this.getDraft(conversationId)

      this.currentChatId = conversationId
      this.replyingTo = draft.replyingTo

      // 如果切换到了不同的会话，才标记已读
      // 委托给conversation store处理已读逻辑
      const conversationStore = useConversationStore()
      await conversationStore.markConversationAsRead(conversationId)
    },
  }
})
