import type { IFriendInfo } from 'commonModule/type/ajax/friend'
import { defineStore } from 'pinia'
import { getFriendInfoApi } from 'renderModule/api/friend'
import { useContactStore } from '../contact/contact'

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
    getFriendList(): IFriendInfo[] {
      return this.friendList.map((friend) => {
        const contactStore = useContactStore()
        const contactInfo = contactStore.getContact(friend.userId)
        console.log('555555555555555555555555', contactInfo)
        if (contactInfo) {
          return {
            ...friend,
            nickname: contactInfo.nickName || friend.nickname,
            avatar: contactInfo.avatar || friend.avatar,
          }
        }

        return friend
      })
    },
    /**
     * @description: 根据用户ID获取好友信息（包含联系人信息）
     * @param {string} userId - 用户ID
     * @returns {IFriendInfo | undefined} 返回好友信息
     */
    getFriendByUserId: (state) => {
      return (userId: string): IFriendInfo | undefined => {
        const friend = state.friendList.find(friend => friend.userId === userId)
        if (friend) {
          // 从contactStore获取最新的联系人信息
          const contactStore = useContactStore()
          const contactInfo = contactStore.getContact(userId)
          if (contactInfo) {
            // 返回增强后的好友信息
            return {
              ...friend,
              nickname: contactInfo.nickName || friend.nickname,
              avatar: contactInfo.avatar || friend.avatar,
            }
          }
        }
        return friend
      }
    },

    /**
     * @description: 根据会话ID获取好友信息（包含联系人信息）
     * @param {string} conversationId - 会话ID
     * @returns {IFriendInfo | undefined} 返回好友信息
     */
    getFriendByConversationId: (state) => {
      return (conversationId: string): IFriendInfo | undefined => {
        const friend = state.friendList.find(friend => friend.conversationId === conversationId)
        console.log('3333333333333333', state.friendList)
        if (!friend) {
          console.error('好友信息未找到，conversationId:', conversationId)
          return undefined
        }

        // 从contactStore获取最新的联系人信息
        const contactStore = useContactStore()
        const contactInfo = contactStore.getContact(friend.userId)
        if (contactInfo) {
          // 返回增强后的好友信息
          return {
            ...friend,
            nickname: contactInfo.nickName || friend.nickname,
            avatar: contactInfo.avatar || friend.avatar,
          }
        }

        return friend
      }
    },
  },

  actions: {
    reset() {
      this.friendList = []
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

      // 将好友信息同步到联系人缓存中
      const contactStore = useContactStore()
      this.friendList.forEach((friend) => {
        if (friend.userId) {
          // 只更新好友模块特有的字段，其他字段如果已有则保持不变
          contactStore.updateContact(friend.userId, {
            userId: friend.userId,
            nickName: friend.nickname,
            avatar: friend.avatar,
          })
        }
      })
    },
  },
})
