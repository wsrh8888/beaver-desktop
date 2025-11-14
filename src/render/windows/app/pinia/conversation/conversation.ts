import type { IConversationInfoRes } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'
import { useContactStore } from '../contact/contact'
import { useUserStore } from '../user/user'
import { useGroupStore } from '../group/group'

/**
 * @description: 会话管理
 */
export const useConversationStore = defineStore('useConversationStore', {
  state: () => ({
    /**
     * @description: 会话列表（有序数组）
     */
    conversations: [] as IConversationInfoRes[],

    /**
     * @description: 分页加载状态
     */
    hasMore: true,
    isLoadingMore: false,
    pageSize: 50, // 每次加载的数量
    currentPage: 1, // 当前加载的页码
    currentMaxVersion: 0, // 当前加载的最大版本号（用于增量同步）
  }),

  getters: {
    getConversations(): IConversationInfoRes[] {
      const contactStore = useContactStore()
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo.userId
      const groupStore = useGroupStore()


      return this.conversations.map((conversation) => {
        // 如果是私聊，从 contactStore 获取最新的用户信息
        if (conversation.chatType === 1) {
          const parts = conversation.conversationId.split('_')
          if (parts.length >= 3) {
            // 解析出对方的用户ID
            const userId1 = parts[1]
            const userId2 = parts[2]
            const otherUserId = (userId1 === currentUserId) ? userId2 : userId1

            // 从 contactStore 获取最新的用户信息
            const contactInfo = contactStore.getContact(otherUserId)
            if (contactInfo) {
              return {
                ...conversation,
                avatar: contactInfo.avatar || conversation.avatar,
                nickname: contactInfo.nickName || conversation.nickname,
              }
            }
          }
        } else if (conversation.chatType === 2) {
          const groupInfo = groupStore.getGroupById(conversation.conversationId)
          if (groupInfo) {
            return {
              ...conversation,
              avatar: groupInfo.avatar || conversation.avatar,
              nickname: groupInfo.title || conversation.nickname,
            }
          }
        }

        // 群聊或其他类型保持原样
        return conversation
      })
    },

    getConversationInfo: state => (conversationId: string) => {
      const conversation = state.conversations.find((c: IConversationInfoRes) => c.conversationId === conversationId)
      if (!conversation)
        return null

      const contactStore = useContactStore()
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo.userId

      // 如果是私聊，从 contactStore 获取最新的用户信息
      if (conversation.conversationId.startsWith('private_')) {
        const parts = conversation.conversationId.split('_')
        if (parts.length >= 3) {
          // 解析出对方的用户ID
          const userId1 = parts[1]
          const userId2 = parts[2]
          const otherUserId = (userId1 === currentUserId) ? userId2 : userId1

          // 从 contactStore 获取最新的用户信息
          const contactInfo = contactStore.getContact(otherUserId)
          if (contactInfo) {
            return {
              ...conversation,
              avatar: contactInfo.avatar || conversation.avatar,
              nickname: contactInfo.nickName || conversation.nickname,
            }
          }
        }
      }

      // 群聊或其他类型保持原样
      return conversation
    },

  },

  actions: {
    /**
     * @description: 重置store状态
     */
    reset() {
      this.conversations = []
      this.hasMore = true
      this.isLoadingMore = false
      this.currentPage = 1
      this.currentMaxVersion = 0
    },

    /**
     * @description: 初始化会话列表（获取第一页会话）
     */
    async init() {
      this.currentPage = 1

      const result = await electron.database.chat.getRecentChatList({
        page: this.currentPage,
        limit: this.pageSize,
      })

      if (result.list && result.list.length > 0) {
        // 后端已经按时间排序，这里只需要处理置顶排序
        this.conversations = result.list.sort((a: IConversationInfoRes, b: IConversationInfoRes) => {
          // 置顶的排在前面
          if (a.is_top !== b.is_top) {
            return b.is_top ? 1 : -1
          }
          // 时间排序由后端保证，这里保持原有顺序
          return 0
        })

        // 记录当前最大版本号，用于增量同步
        this.currentMaxVersion = Math.max(...result.list.map(c => c.version))

        // 判断是否还有更多数据
        this.hasMore = result.list.length >= this.pageSize
      }
      else {
        this.hasMore = false
      }
    },

    /**
     * @description: 加载更多会话（页码分页）
     */
    async loadMoreConversations() {
      if (!this.hasMore || this.isLoadingMore) {
        return
      }

      this.isLoadingMore = true

      try {
        this.currentPage += 1

        const result = await electron.database.chat.getRecentChatList({
          page: this.currentPage,
          limit: this.pageSize,
        })

        if (result.list && result.list.length > 0) {
          // 对新数据进行置顶排序，然后追加到列表末尾
          const sortedNewConversations = result.list.sort((a: IConversationInfoRes, b: IConversationInfoRes) => {
            if (a.is_top !== b.is_top) {
              return b.is_top ? 1 : -1
            }
            return 0 // 时间排序由后端保证
          })

          // 追加到列表末尾
          this.conversations.push(...sortedNewConversations)

          // 更新最大版本号
          const newMaxVersion = Math.max(...result.list.map(c => c.version))
          this.currentMaxVersion = Math.max(this.currentMaxVersion, newMaxVersion)

          // 判断是否还有更多数据
          this.hasMore = result.list.length >= this.pageSize
        }
        else {
          this.hasMore = false
        }
      }
      finally {
        this.isLoadingMore = false
      }
    },

    /**
     * @description: 添加或更新会话（新消息时调用，插入到顶部）
     */
    upsertConversation(conversation: IConversationInfoRes) {
      const index = this.conversations.findIndex((c: IConversationInfoRes) => c.conversationId === conversation.conversationId)

      if (index !== -1) {
        // 更新现有会话，保持位置（除非是置顶变化）
        this.conversations[index] = conversation

        // 更新最大版本号
        this.currentMaxVersion = Math.max(this.currentMaxVersion, conversation.version)

        // 如果置顶状态改变，需要重新排序
        if (this.conversations[index].is_top !== conversation.is_top) {
          this.resortConversations()
        }
      }
      else {
        // 新会话插入到顶部
        this.conversations.unshift(conversation)

        // 更新最大版本号
        this.currentMaxVersion = Math.max(this.currentMaxVersion, conversation.version)
      }
    },

    /**
     * @description: 重新排序会话列表
     */
    resortConversations() {
      this.conversations.sort((a: IConversationInfoRes, b: IConversationInfoRes) => {
        // 置顶的排在前面
        if (a.is_top !== b.is_top) {
          return b.is_top ? 1 : -1
        }

        // 按最后更新时间倒序
        const timeA = new Date(a.update_at).getTime()
        const timeB = new Date(b.update_at).getTime()
        return timeB - timeA
      })
    },
  },
})
