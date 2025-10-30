import type { IChatInfo } from 'commonModule/type/ajax/chat'
import { defineStore } from 'pinia'

import { getRecentChatInfoApi, getRecentChatListApi } from 'renderModule/api/chat'
import { useFriendStore } from 'renderModule/app/pinia/friend/friend'
import { useGroupStore } from 'renderModule/app/pinia/group/group'

/**
 * @description: 会话管理
 */
export const useConversationStore = defineStore('useConversationStore', {
  state: () => ({
    /**
     * @description: 最近会话列表
     */
    _recentChatList: [] as IChatInfo[],

    /**
     * @description: 分页相关状态
     */
    pagination: {
      page: 0,
      pageSize: 20,
      totalCount: 0,
    },
  }),

  getters: {
    /**
     * @description: 是否还有更多数据
     */
    hasMore: (state) => {
      return state._recentChatList.length < state.pagination.totalCount
    },

    getRecentChatList: state => () => {
      console.error('111111111', state._recentChatList)
      return state._recentChatList.sort((a, b) => {
        // 置顶的排在前面
        // if (a.is_top !== b.is_top) return b.is_top ? 1 : -1;
        // 按最后消息时间排序
        return new Date(b.update_at).getTime() - new Date(a.update_at).getTime()
      }).map((recentChatInfo) => {
        // 判断是不是群组
        const groupStore = useGroupStore()
        // 如果是群组则到group中更新信息， 否则去user表更新基础西悉尼
        let info = {}
        if (recentChatInfo.chatType === 1) {
          // Handle private chat
        }
        else {
          const groupInfo = groupStore.getGroupById(recentChatInfo.conversationId)
          if (groupInfo) {
            info = {
              nickname: groupInfo.title,
              avatar: groupInfo.avatar,
            }
          }
        }
        return {
          ...recentChatInfo,
          ...info,
        }
      })
    },

    /**
     * @description: 获取会话信息
     * @param {string} conversationId - 会话ID
     * @return {IChatInfo | null} 会话信息
     */
    getConversationInfo: state => (conversationId: string) => {
      // 先从最近会话列表中查找
      const conversation = state._recentChatList.find(
        chat => chat.conversationId === conversationId,
      )

      if (conversation) {
        return conversation
      }

      // 如果在最近会话列表中找不到，则从好友列表或群组列表中获取基本信息
      const friendStore = useFriendStore()
      const groupStore = useGroupStore()

      // 尝试从好友列表中获取
      const friendInfo = friendStore.getFriendInfoById(conversationId)
      if (friendInfo) {
        return {
          conversationId: friendInfo.conversationId,
          avatar: friendInfo.avatar,
          nickname: friendInfo.nickname,
          create_at: new Date().toISOString(),
          update_at: new Date().toISOString(),
          is_top: false,
          msg_preview: '',
          unread_count: 0,
        } as IChatInfo
      }

      // 尝试从群组列表中获取
      const groupInfo = groupStore.getGroupById(conversationId)
      if (groupInfo) {
        return {
          conversationId: groupInfo.conversationId,
          avatar: groupInfo.avatar,
          nickname: groupInfo.name || groupInfo.title,
          create_at: new Date().toISOString(),
          update_at: new Date().toISOString(),
          is_top: false,
          msg_preview: '',
          unread_count: 0,
        } as IChatInfo
      }

      return null
    },
  },

  actions: {
    reset() {
      this._recentChatList = []
      this.pagination = {
        page: 0,
        pageSize: 20,
        totalCount: 0,
      }
    },

    /**
     * @description: 从主进程初始化会话列表（分页）
     */
    async initConversationFromMain() {
      await this.loadConversations(0, true)
    },

    /**
     * @description: 分页加载会话列表
     * @param {number} page - 页码，从0开始
     * @param {boolean} reset - 是否重置列表
     * @param {number} pageSize - 每页大小
     */
    async loadConversations(page: number = 0, reset: boolean = false, pageSize: number = 20) {
      try {
        const result = await electron.database.getConversations({
          page,
          pageSize,
          sortBy: 'update_at',
          sortOrder: 'DESC',
        })

        if (reset || page === 0) {
          // 重置列表
          this._recentChatList = result.data
        }
        else {
          // 追加到列表
          this._recentChatList.push(...result.data)
        }

        // 更新分页状态
        this.pagination = {
          page,
          pageSize,
          totalCount: result.totalCount,
        }

        console.log(`会话列表加载成功: 第${page + 1}页，共${result.data.length}条，总计${result.totalCount}条`)
      }
      catch (error) {
        console.error('加载会话列表失败:', error)
        throw error
      }
    },

    /**
     * @description: 加载更多会话
     */
    async loadMore() {
      if (!this.hasMore) {
        return
      }

      const nextPage = this.pagination.page + 1
      await this.loadConversations(nextPage, false)
    },

    /**
     * @description: 刷新会话列表
     */
    async refresh() {
      await this.loadConversations(0, true)
    },

    /**
     * @description: 获取最近会话列表
     */
    async initRecentChatApi() {
      try {
        const res = await getRecentChatListApi()
        if (res.code === 0) {
          const chatList = res.result.list || []
          console.log('获取聊天列表:', chatList.length, '条记录')

          // 直接使用原始数据，不需要特殊处理

          this._recentChatList = chatList
        }
      }
      catch (error) {
        console.error('Failed to fetch recent chats:', error)
        throw error
      }
    },

    updateConversationListByFriendId(conversationId: string) {
      getRecentChatInfoApi({ conversationId })
        .then((res) => {
          if (res.code === 0 && res.result) {
            // Check if the conversation already exists in the list
            const existingIndex = this._recentChatList.findIndex(
              chat => chat.conversationId === res.result.conversationId,
            )

            if (existingIndex !== -1) {
              // Update existing conversation
              this._recentChatList[existingIndex] = {
                ...this._recentChatList[existingIndex],
                ...res.result,
              }
            }
            else {
              // Add new conversation to the top of the list
              this._recentChatList.unshift(res.result)
            }
          }
          else {
            console.error('Failed to get conversation info:', res.msg)
          }
        })
        .catch((error) => {
          console.error('Error fetching conversation info:', error)
        })
    },

    /**
     * @description: 更新会话基本信息
     */
    updateBaseInfo(data: IChatInfo) {
      const index = this._recentChatList.findIndex(
        item => item.conversationId === data.conversationId,
      )

      if (index !== -1) {
        this._recentChatList[index] = {
          ...this._recentChatList[index],
          ...data,
        }
      }
      else {
        // 数组第一项追加
        this._recentChatList.unshift(data)
      }
    },

    /**
     * @description: 置顶/取消置顶会话
     */
    toggleChatTop(conversationId: string) {
      const index = this._recentChatList.findIndex(
        chat => chat.conversationId === conversationId,
      )
      if (index !== -1) {
        this._recentChatList[index].is_top = !this._recentChatList[index].is_top
      }
    },

    /**
     * @description: 更新会话列表中的最新消息
     * @param {string} conversationId - 会话ID
     * @param {object} message - 消息对象
     * @param {string} message.msg - 消息内容
     * @param {string} message.createAt - 消息时间
     */
    updateLastMessage(conversationId: string, message: { msg: string, createAt: string }) {
      const index = this._recentChatList.findIndex(
        item => item.conversationId === conversationId,
      )

      if (index !== -1) {
        // 更新现有会话
        this._recentChatList[index] = {
          ...this._recentChatList[index],
          msg_preview: message.msg,
          update_at: message.createAt,
          unread_count: (this._recentChatList[index].unread_count || 0) + 1,
        }

        // 将更新的会话移动到列表顶部
        const updatedConversation = this._recentChatList.splice(index, 1)[0]
        this._recentChatList.unshift(updatedConversation)

        console.log(`会话 ${conversationId} 消息已更新`)
      }
      else {
        // 新会话，需要从服务器获取完整信息
        console.warn(`会话 ${conversationId} 不存在于当前列表中，需要重新加载`)
        // 可以选择触发重新加载或者忽略
      }
    },

    /**
     * @description: 设置会话列表（用于主进程批量更新）
     * @param {IChatInfo[]} conversations - 会话列表
     */
    setConversations(conversations: IChatInfo[]) {
      this._recentChatList = conversations
      console.log(`会话列表已更新，共${conversations.length}条记录`)
    },

    // 添加会话状态同步方法
    async syncConversationState() {
      await this.initRecentChatApi()
      // 可以添加其他同步逻辑
    },
  },
})
