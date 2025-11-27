import type { IConversationInfoRes } from 'commonModule/type/ajax/chat'
import type { IConversationItem } from 'commonModule/type/pinia/conversation'
import { formatConversationTime } from 'commonModule/utils/time/time'
import { defineStore } from 'pinia'
import { getRecentChatInfoApi } from 'renderModule/api/chat'
import { useContactStore } from '../contact/contact'
import { useGroupStore } from '../group/group'
import { useUserStore } from '../user/user'

/**
 * @description: 会话管理
 */
export const useConversationStore = defineStore('useConversationStore', {
  state: () => ({
    /**
     * @description: 会话列表（有序数组，使用 Store 内部类型）
     */
    conversations: [] as IConversationItem[],

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
      const currentUserId = userStore.getUserId
      const groupStore = useGroupStore()

      return this.conversations.map((conversation: IConversationItem) => {
        // 格式化时间：从 updatedAt（秒级）转换为格式化字符串
        const formattedTime = conversation.updatedAt
          ? formatConversationTime(conversation.updatedAt)
          : ''

        // 转换为组件使用的类型，包含格式化后的时间
        let result: IConversationInfoRes = {
          ...conversation,
          updateAt: formattedTime,
        }

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
              result = {
                ...result,
                avatar: contactInfo.avatar || conversation.avatar,
                // contactInfo 可能没有 nickName 字段，保持原有 nickName
                nickName: conversation.nickName,
              }
            }
          }
        }
        else if (conversation.chatType === 2) {
          const groupInfo = groupStore.getGroupById(conversation.conversationId)
          if (groupInfo) {
            result = {
              ...result,
              avatar: groupInfo.avatar || conversation.avatar,
              nickName: groupInfo.title || conversation.nickName,
            }
          }
        }

        return result
      })
    },

    /**
     * @description: 获取置顶的会话列表
     */
    getTopConversations(): IConversationInfoRes[] {
      return this.getConversations.filter(conversation => conversation.isTop)
    },

    getConversationInfo: state => (conversationId: string) => {
      const conversation = state.conversations.find((c: IConversationItem) => c.conversationId === conversationId)
      if (!conversation)
        return null

      // 格式化时间：从 updatedAt（秒级）转换为格式化字符串
      const formattedTime = conversation.updatedAt
        ? formatConversationTime(conversation.updatedAt)
        : ''

      // 转换为组件使用的类型，包含格式化后的时间
      let result: IConversationInfoRes = {
        ...conversation,
        updateAt: formattedTime,
      }

      const contactStore = useContactStore()
      const userStore = useUserStore()
      const currentUserId = userStore.getUserId

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
            result = {
              ...result,
              avatar: contactInfo.avatar || conversation.avatar,
              // contactInfo 可能没有 nickName 字段，保持原有 nickName
              nickName: conversation.nickName,
            }
          }
        }
      }

      return result
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
        // 转换为 Store 内部类型（移除 updateAt，只保留 updatedAt）
        const conversationItems: IConversationItem[] = result.list.map((conv: IConversationInfoRes) => {
          const { updateAt, ...rest } = conv
          return rest as IConversationItem
        })

        // 后端已经按时间排序，这里只需要处理置顶排序
        this.conversations = conversationItems.sort((a: IConversationItem, b: IConversationItem) => {
          // 置顶的排在前面
          if (a.isTop !== b.isTop) {
            return b.isTop ? 1 : -1
          }
          // 时间排序由后端保证，这里保持原有顺序
          return 0
        })
        console.log('conversations', this.conversations)

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
          // 转换为 Store 内部类型（移除 updateAt，只保留 updatedAt）
          const conversationItems: IConversationItem[] = result.list.map((conv: IConversationInfoRes) => {
            const { updateAt, ...rest } = conv
            return rest as IConversationItem
          })

          // 对新数据进行置顶排序，然后追加到列表末尾
          const sortedNewConversations = conversationItems.sort((a: IConversationItem, b: IConversationItem) => {
            if (a.isTop !== b.isTop) {
              return b.isTop ? 1 : -1
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
      // 转换为 Store 内部类型（移除 updateAt，只保留 updatedAt）
      const { updateAt, ...conversationItem } = conversation
      const item: IConversationItem = conversationItem as IConversationItem

      const index = this.conversations.findIndex((c: IConversationItem) => c.conversationId === item.conversationId)

      if (index !== -1) {
        // 更新现有会话
        this.conversations[index] = item

        // 更新最大版本号
        this.currentMaxVersion = Math.max(this.currentMaxVersion, item.version)

        // 更新会话后，需要重新排序（确保最新消息的会话排到顶部）
        this.resortConversations()
      }
      else {
        // 新会话插入到顶部
        this.conversations.unshift(item)

        // 更新最大版本号
        this.currentMaxVersion = Math.max(this.currentMaxVersion, item.version)
      }
    },

    /**
     * @description: 重新排序会话列表
     */
    resortConversations() {
      this.conversations.sort((a: IConversationItem, b: IConversationItem) => {
        // 置顶的排在前面
        if (a.isTop !== b.isTop) {
          return b.isTop ? 1 : -1
        }

        // 按最后更新时间倒序（直接使用 updatedAt 字段）
        return (b.updatedAt || 0) - (a.updatedAt || 0)
      })
    },

    /**
     * @description: 通过会话ID初始化会话（确保会话存在）
     * 优先级：本地store -> 主进程数据库 -> 服务端API
     */
    async initConversationById(conversationId: string) {
      // 1. 先检查本地store是否已存在
      const existingConversation = this.conversations.find((c: IConversationItem) => c.conversationId === conversationId)
      if (existingConversation) {
        return existingConversation
      }

      // 2. 本地不存在，从主进程数据库查询（包含隐藏的会话）
      try {
        const localResult = await electron.database.chat.getConversationInfo({
          conversationId,
        })

        if (localResult) {
          // 主进程有数据，添加到store并移到顶部
          this.upsertConversation(localResult)
          this.moveConversationToTop(conversationId)
          return localResult
        }
      }
      catch (error) {
        console.warn('从主进程获取会话信息失败:', error)
      }

      // 3. 主进程也没有，从服务端获取
      try {
        const serverResult = await getRecentChatInfoApi({
          conversationId,
        })

        if (serverResult && serverResult.result) {
          // 服务端有数据，添加到store并移到顶部
          this.upsertConversation(serverResult.result)
          this.moveConversationToTop(conversationId)
          return serverResult.result
        }
      }
      catch (error) {
        console.error('从服务端获取会话信息失败:', error)
        throw error
      }

      // 4. 都没有找到
      throw new Error(`会话 ${conversationId} 不存在`)
    },

    /**
     * @description: 根据会话ID批量更新会话信息（用于数据库更新通知）
     */
    async batchUpdateConversationsByIds(conversationIds: string[]) {
      if (!conversationIds || conversationIds.length === 0) {
        return
      }

      try {
        // 并行获取所有需要更新的会话信息
        const updatePromises = conversationIds.map(async (conversationId) => {
          try {
            // 1. 首先从主进程数据库获取最新的会话信息
            const localResult = await electron.database.chat.getConversationInfo({
              conversationId,
            })

            if (localResult) {
              // 2. 更新本地store中的会话信息
              this.upsertConversation(localResult)
              return { conversationId, success: true }
            }
            else {
              // 3. 主进程没有，从服务端获取
              const serverResult = await getRecentChatInfoApi({
                conversationId,
              })

              if (serverResult && serverResult.result) {
                // 4. 更新本地store中的会话信息
                this.upsertConversation(serverResult.result)
                return { conversationId, success: true }
              }
              else {
                return { conversationId, success: false, error: '服务端也没有找到会话信息' }
              }
            }
          }
          catch (error) {
            return { conversationId, success: false, error: (error as Error).message }
          }
        })

        // 等待所有更新完成
        const results = await Promise.all(updatePromises)

        // 重新排序会话列表
        this.resortConversations()

        // 统计结果
        const successCount = results.filter(r => r.success).length
        const failedResults = results.filter(r => !r.success)

        if (failedResults.length > 0) {
          console.warn(`批量更新会话信息完成，成功: ${successCount}，失败: ${failedResults.length}`, failedResults)
        }
        else {
          console.log(`批量更新会话信息完成，成功更新 ${successCount} 个会话`)
        }
      }
      catch (error) {
        console.error('批量更新会话信息失败:', error)
        throw error
      }
    },

    /**
     * @description: 将指定会话移到列表顶部
     */
    moveConversationToTop(conversationId: string) {
      const index = this.conversations.findIndex((c: IConversationItem) => c.conversationId === conversationId)
      if (index > 0) {
        // 找到会话，移到顶部
        const [conversation] = this.conversations.splice(index, 1)
        this.conversations.unshift(conversation)
      }
    },
  },
})
