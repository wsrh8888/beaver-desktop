import type { AppLifecycleStatus } from 'commonModule/type/preload/notification'
import { defineStore } from 'pinia'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useContactStore } from '../contact/contact'
import { useFriendVerifyStore } from '../friend/friend_verify'
import { useUpdateStore } from '../update/index'
import { useEmojiStore } from '../emoji/emoji'
import { useNotificationStore } from '../notification/notification'

/**
 * @description: 全局应用状态管理
 * 管理应用初始化、连接状态等全局状态
 */
export const useAppStore = defineStore('useAppStore', {
  state: () => ({
    /**
     * @description: 应用生命周期状态
     */
    lifecycleStatus: 'connecting' as AppLifecycleStatus,
  }),

  getters: {
    // 全局store只保留核心状态，UI相关的转换逻辑移到组件内部
  },

  actions: {

    /**
     * @description: 获取应用生命周期的初始状态
     */
    async getInitialLifecycleStatus() {
      try {
        const initialStatus = await window.electron.datasync.getAppLifecycleStatus()
        this.updateLifecycleStatus(initialStatus.status)
        return initialStatus.status
      }
      catch (error) {
        console.error('获取应用初始状态失败:', error)
        // 获取失败时保持默认状态
        return this.lifecycleStatus
      }
    },

    /**
     * @description: 启动应用初始化（应用启动时调用）
     */
    async initApp() {
      const userStore = useUserStore()
      const friendStore = useFriendStore()
      const _friendVerifyStore = useFriendVerifyStore()
      const conversationStore = useConversationStore()
      const groupStore = useGroupStore()
      const updateStore = useUpdateStore()
      const contactStore = useContactStore()
      const emojiStore = useEmojiStore()
      const notificationStore = useNotificationStore()

      try {
        // 首先获取应用生命周期的初始状态
        await this.getInitialLifecycleStatus()

        // 并行初始化各项数据
        const promises = [
          userStore.init(),
          contactStore.init(),
          friendStore.init(),
          conversationStore.init(),
          groupStore.init(),
          updateStore.init(),
          emojiStore.init(),
          notificationStore.init(),
        ]

        await Promise.all(promises)
        console.log('应用数据初始化完成')
      }
      catch (error) {
        console.error('应用初始化失败:', error)
      }
    },

    /**
     * @description: 更新应用生命周期状态
     */
    updateLifecycleStatus(status: AppLifecycleStatus) {
      this.lifecycleStatus = status
    },

  },
})
