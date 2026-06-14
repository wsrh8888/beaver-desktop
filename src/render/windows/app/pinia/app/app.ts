import type { AppLifecycleStatus } from 'commonModule/type/preload/notification'
import { defineStore } from 'pinia'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useContactStore } from '../contact/contact'
import { useEmojiStore } from '../emoji/emoji'
import { useNotificationStore } from '../notification/notification'
import { useMessageMediaStore } from '../message/message-media'
import { useUpdateStore } from '../update/index'

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
      try {
        // 首先获取应用生命周期的初始状态
        await this.getInitialLifecycleStatus()
        // 然后加载各模块数据
        await this.loadAllStoreData()
        console.log('应用初始化完成')
      }
      catch (error) {
        console.error('应用初始化失败:', error)
      }
    },

    /**
     * @description: 全量加载/刷新所有 Store 数据
     * 当同步完成后（ready状态）或应用启动时调用
     */
    async loadAllStoreData() {
      const userStore = useUserStore()
      const friendStore = useFriendStore()
      const conversationStore = useConversationStore()
      const groupStore = useGroupStore()
      const updateStore = useUpdateStore()
      const contactStore = useContactStore()
      const emojiStore = useEmojiStore()
      const notificationStore = useNotificationStore()
      const messageMediaStore = useMessageMediaStore()

      try {
        console.log('[AppStore] 开始加载/刷新各模块数据...')
        const promises = [
          userStore.init(),
          contactStore.init(),
          friendStore.init(),
          conversationStore.init(),
          groupStore.init(),
          updateStore.init(),
          emojiStore.init(),
          notificationStore.init(),
          messageMediaStore.init(),
        ]
        await Promise.all(promises)
        console.log('[AppStore] 各模块数据同步加载完成')
      }
      catch (error) {
        console.error('[AppStore] 加载各模块数据失败:', error)
        throw error
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
