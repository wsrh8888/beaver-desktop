import type { IConversationInfoRes } from 'commonModule/type/ajax/chat'
import type { IConversationItem } from 'commonModule/type/pinia/conversation'
import { formatConversationTime } from 'commonModule/utils/time/time'
import { defineStore } from 'pinia'
import { getRecentChatInfoApi } from 'renderModule/api/chat'
import { useContactStore } from '../contact/contact'
import { useGroupStore } from '../group/group'
import { useUserStore } from '../user/user'
import { useMessageStore } from '../message/message'
import { updateReadSeqApi } from 'renderModule/api/chat'

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
     * @description: 当前加载的最大版本号（用于增量同步）
     */
    currentMaxVersion: 0,

    /**
     * @description: 已读序列号更新缓存，避免重复API调用
     */
    lastReadSeqUpdate: null as Map<string, number> | null,

  }),

  getters: {
    /**
     * @description 获取会话列表
     */
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
          updatedAtStr: formattedTime,
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
    /**
     * @description  通过会话id获取会话信息
     */
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
        updatedAtStr: formattedTime,
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

    /**
     * @description: 获取总未读消息数（排除免打扰的会话）
     */
    getTotalUnreadCount(): number {
      return this.conversations.reduce((total, conversation) => {
        if (conversation.isMuted) {
          return total
        }
        return total + (conversation.unreadCount || 0)
      }, 0)
    },

  },

  actions: {

    /**
     * @description: 初始化会话列表（递归获取全部会话）
     */
    async init() {
      this.conversations = []

      // 递归获取全部会话数据
      const allConversations = await this.loadAllConversations()

      if (allConversations.length > 0) {
        // 服务器返回的数据已经是 IConversationItem 格式，直接使用
        const conversationItems: IConversationItem[] = allConversations as IConversationItem[]

        // 后端已经按时间排序，这里只需要处理置顶排序
        this.conversations = conversationItems.sort((a: IConversationItem, b: IConversationItem) => {
          // 置顶的排在前面
          if (a.isTop !== b.isTop) {
            return b.isTop ? 1 : -1
          }
          // 时间排序由后端保证，这里保持原有顺序
          return 0
        })


        // 记录当前最大版本号，用于增量同步
        this.currentMaxVersion = Math.max(...allConversations.map(c => c.version))

        // 初始化完成后，通知托盘更新未读消息菜单项
        electron.notification.updateTray({
          menuItems: this.conversations
            .filter(conversation => !conversation.isMuted && (conversation.unreadCount || 0) > 0)
            .map(conversation => ({
              id: conversation.conversationId,
              label: `${conversation.nickName}`,
              count: conversation.unreadCount,
              type: 'chat' as const
            }))
        })
      }
    },

    /**
     * @description: 递归加载全部会话数据
     */
    async loadAllConversations(page: number = 1): Promise<IConversationInfoRes[]> {
      const result = await electron.database.chat.getRecentChatList({
        page,
        limit: 500,
      })

      if (!result.list || result.list.length === 0) {
        return []
      }

      const currentPageData = result.list

      // 如果当前页数据达到 500，可能还有更多数据，继续递归
      if (currentPageData.length >= 500) {
        const nextPageData = await this.loadAllConversations(page + 1)
        return [...currentPageData, ...nextPageData]
      }
      else {
        // 当前页数据不足 500，说明已经是最后一页
        return currentPageData
      }
    },


    /**
     * @description: 添加或更新会话（新消息时调用，插入到顶部）
     */
    upsertConversation(conversation: IConversationInfoRes) {
      // 服务器返回的数据已经是 IConversationItem 格式，直接使用
      const item: IConversationItem = conversation as IConversationItem

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
     * @description: 标记会话为已读（本地立即更新 + API同步）
     */
    async markConversationAsRead(conversationId: string) {
      console.error('55555555555555555555555', conversationId)
      electron.notification.deleteTrayItem(conversationId)

      // 1. 立即在本地清零未读数（乐观更新）
      const conversationIndex = this.conversations.findIndex(conv => conv.conversationId === conversationId)

      if (conversationIndex !== -1) {
        // 将未读数设为0
        this.conversations[conversationIndex].unreadCount = 0

        console.log(`[ConversationStore] 本地清零未读数: conversationId=${conversationId}`)
      }

      // 2. 同步更新托盘

      // 3. 异步调用API更新后端已读数
      setTimeout(async () => {
        await this.syncReadSeqToServer(conversationId)
      }, 100)
    },


    /**
     * @description: 同步已读序列号到服务器
     */
    async syncReadSeqToServer(conversationId: string) {
      try {
        // 获取最新消息序列号
        const messageStore = useMessageStore()
        const messages = messageStore.getChatHistory(conversationId)

        if (!messages || messages.length === 0) {
          return
        }

        const maxSeq = Math.max(...messages.map((m: any) => m.seq || 0))

        // 检查是否已经更新过这个序列号
        const lastUpdate = this.lastReadSeqUpdate?.get(conversationId)
        if (lastUpdate === maxSeq) {
          return // 已经更新过
        }

        if (maxSeq > 0) {
          // 调用API更新已读数
          await updateReadSeqApi({ conversationId, readSeq: maxSeq })

          // 记录更新状态
          if (!this.lastReadSeqUpdate) {
            this.lastReadSeqUpdate = new Map()
          }
          this.lastReadSeqUpdate.set(conversationId, maxSeq)

          console.log(`[ConversationStore] 同步已读数到服务器: conversationId=${conversationId}, readSeq=${maxSeq}`)
        }
      }
      catch (error) {
        console.error('[ConversationStore] 同步已读数失败:', error)
      }
    },

    /**
     * @description: 更新托盘未读消息菜单项
     */
    updateTrayUnreadItems() {
      electron.notification.updateTray({
        menuItems: this.conversations
          .filter(conversation => !conversation.isMuted && (conversation.unreadCount || 0) > 0)
          .map(conversation => ({
            id: conversation.conversationId,
            label: `${conversation.nickName}`,
            count: conversation.unreadCount,
            type: 'chat' as const
          }))
      })
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
            console.error('批量更新会话了', localResult)
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
