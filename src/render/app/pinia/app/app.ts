import { defineStore } from 'pinia'
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/app/pinia/friend/friend'
import { useUserStore } from 'renderModule/app/pinia/user/user'
import { useFriendVerifyStore } from '../friend/friend_verify'

/**
 * 连接状态类型
 */
type ConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'ready' | 'error'

/**
 * @description: 全局应用状态管理
 * 管理应用初始化、连接状态等全局状态
 */
export const useAppStore = defineStore('useAppStore', {
  state: () => ({
    /**
     * @description: 是否已完成初始化
     */
    isInitialized: false,

    /**
     * @description: 连接状态
     */
    connectionStatus: 'disconnected' as ConnectionStatus,
  }),

  getters: {
    /**
     * @description: 连接状态文本
     */
    connectionStatusText: (state) => {
      switch (state.connectionStatus) {
        case 'connected': return '已连接'
        case 'disconnected': return '未连接'
        case 'syncing': return '同步中'
        case 'ready': return '就绪'
        case 'error': return '连接错误'
        default: return '未知状态'
      }
    },
  },

  actions: {

    /**
     * @description: 启动应用初始化（应用启动时调用，不阻塞UI渲染）
     */
    async initApp() {
      if (this.isInitialized) {
        return
      }

      const userStore = useUserStore()
      const friendStore = useFriendStore()
      const friendVerifyStore = useFriendVerifyStore()
      const conversationStore = useConversationStore()

      try {
        // 1. 初始化用户信息
        await userStore.init()

        // 2. 并行初始化好友和会话数据
        const promises = [
          friendStore.init(),
          conversationStore.init(),
          friendVerifyStore.init(),
        ]

        await Promise.all(promises)

        this.isInitialized = true
        console.log('应用数据初始化完成')
      }
      catch (error) {
        console.error('应用初始化失败:', error)
        // 初始化失败不阻断应用使用
      }
    },

    /**
     * @description: 更新连接状态
     */
    updateConnectionStatus(status: ConnectionStatus) {
      this.connectionStatus = status
      console.log(`连接状态: ${this.connectionStatusText}`)
    },

  },
})
