import type { IFriendInfo } from 'commonModule/type/ajax/friend'
import { defineStore } from 'pinia'
import { getFriendInfoApi } from 'renderModule/api/friend'

/**
 * @description: 好友信息管理
 */
export const useFriendStore = defineStore('friendStore', {
  state: (): {
    friendList: IFriendInfo[]
  } => ({
    /**
     * @description: 好友列表
     */
    friendList: [],
  }),

  getters: {
    /**
     * @description: 根据用户ID获取好友信息
     * @param {string} userId - 用户ID
     * @returns {IFriendInfo | undefined} 返回好友信息
     */
    getFriendByUserId: (state) => {
      return (userId: string): IFriendInfo | undefined => {
        return state.friendList.find(friend => friend.userId === userId)
      }
    },

    /**
     * @description: 根据会话ID获取好友信息
     * @param {string} conversationId - 会话ID
     * @returns {IFriendInfo | undefined} 返回好友信息
     */
    getFriendByConversationId: (state) => {
      return (conversationId: string): IFriendInfo | undefined => {
        const friend = state.friendList.find(friend => friend.conversationId === conversationId)
        if (!friend) {
          console.error('好友信息未找到，conversationId:', conversationId)
        }
        return friend
      }
    },
  },

  actions: {
    reset() {
      this.friendList = []
    },
    getFriendInfoById: (state) => {
      return (friendId: string): IFriendInfo | undefined => {
        return state.friendList.find(friend => friend.userId === friendId)
      }
    },
    async updateFriendInfo(friendId: string) {
      const res = await getFriendInfoApi({ friendId })
      if (res.code === 0) {
        const friendInfo = res.result

        const index = this.friendList.findIndex(
          item => item.userId === friendId,
        )

        if (index !== -1) {
          this.friendList[index] = friendInfo
        }
        else {
          this.friendList.push(friendInfo)
        }

        return friendInfo
      }
    },

    async init() {
      const res = await electron.database.friend.getFriendsList({
        page: 1,
        limit: 1000,
      })
      this.friendList = res.list || []
    },
  },
})
