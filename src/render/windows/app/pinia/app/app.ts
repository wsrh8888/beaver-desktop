import type { AppLifecycleStatus } from 'commonModule/type/preload/notification'
import { defineStore } from 'pinia'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useFriendVerifyStore } from '../friend/friend_verify'
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

    /**
     * @description: 同步进度 (0-100)
     */
    syncProgress: 0 as number,
  }),

  getters: {
    /**
     * @description: 生命周期状态文本
     */
    lifecycleStatusText: (state) => {
      switch (state.lifecycleStatus) {
        case 'connecting': return '连接中'
        case 'syncing': return '同步中'
        case 'ready': return '就绪'
        case 'disconnected': return '未连接'
        case 'error': return '连接错误'
        default: return '未知状态'
      }
    },

    /**
     * @description: 是否正在加载中（显示状态条）
     */
    isLoading: (state) => {
      return ['connecting', 'syncing'].includes(state.lifecycleStatus)
    },
  },

  actions: {

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

      try {
        // 并行初始化各项数据
        const promises = [
          userStore.init(),
          friendStore.init(),
          conversationStore.init(),
          groupStore.init(),
          updateStore.init(),
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
    updateLifecycleStatus(status: AppLifecycleStatus, progress?: number) {
      this.lifecycleStatus = status
      if (progress !== undefined) {
        this.syncProgress = progress
      }

      console.log(`应用状态: ${this.lifecycleStatusText}${progress !== undefined ? ` (${progress}%)` : ''}`)
    },

  },
})
