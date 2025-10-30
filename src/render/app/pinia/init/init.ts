import { defineStore } from 'pinia'
import { authenticationApi } from 'renderModule/api/auth'
import { useChatStore } from 'renderModule/app/pinia/chat/chat'
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/app/pinia/friend/friend'
import { useGroupStore } from 'renderModule/app/pinia/group/group'
import { useUserStore } from 'renderModule/app/pinia/user/user'
import { useFriendVerifyStore } from '../friend/friend_verify'

/**
 * @description: 应用初始化和生命周期管理
 */
export const useInitStore = defineStore('useInitStore', {
  state: () => ({
    /**
     * @description: 是否正在初始化
     */
    isInitializing: false,

    /**
     * @description: 是否已完成初始化
     */
    isInitialized: false,

    /**
     * @description: 初始化错误信息
     */
    initError: null as Error | null,

    /**
     * @description: 认证轮询定时器ID
     */
    authTimer: null as number | null,

    /**
     * @description: 最后认证时间
     */
    lastAuthTime: 0,
  }),

  getters: {
    /**
     * @description: 获取初始化状态
     * @return {object} 初始化状态对象
     */
    initStatus: state => ({
      isInitializing: state.isInitializing,
      isInitialized: state.isInitialized,
      hasError: !!state.initError,
      error: state.initError,
    }),
  },

  actions: {
    /**
     * @description: 获取认证状态
     * @return {Promise<void>}
     */
    async getAuthentication() {
      console.log('getAuthentication==')
      try {
        const res = await authenticationApi()
        this.lastAuthTime = Date.now()

        if (res.code === 1) {
          console.error('鉴权失败', res)
          this.resetApp()
          // electron.window.openWindow('login');
        }
      }
      catch (error) {
        console.error('Authentication failed:', error)
        this.initError = error instanceof Error ? error : new Error('Authentication failed')
        throw error
      }
    },

    /**
     * @description: 重置所有 store 状态
     * @return {void}
     */
    resetApp() {
      const stores = {
        user: useUserStore(),
        friend: useFriendStore(),
        conversation: useConversationStore(),
        chat: useChatStore(),
        group: useGroupStore(),
      }

      // 重置所有 store
      Object.values(stores).forEach(store => store.$reset())

      // 重置初始化状态
      this.reset()

      // 关闭 WebSocket 连接
      // WsManager.disconnect();
    },

    /**
     * @description: 启动认证轮询
     * @return {void}
     */
    startAuthPolling() {
      // 清除已存在的定时器
      if (this.authTimer) {
        clearInterval(this.authTimer)
      }

      // 设置新的定时器，每10秒进行一次认证
      this.authTimer = setInterval(() => {
        this.getAuthentication()
      }, 10000) as unknown as number
    },

    /**
     * @description: 停止认证轮询
     * @return {void}
     */
    stopAuthPolling() {
      if (this.authTimer) {
        clearInterval(this.authTimer)
        this.authTimer = null
      }
    },

    /**
     * @description: 初始化应用
     * @return {Promise<void>}
     * @throws {Error} 当初始化失败时抛出错误
     */
    async initApp() {
      // 获取所有需要初始化的 store
      const stores = {
        user: useUserStore(),
        friend: useFriendStore(),
        friendVerify: useFriendVerifyStore(),
      }

      // 并行初始化用户信息和好友列表
      // 这两个初始化优先级最高，其他功能依赖于这些基础信息
      await Promise.all([
        stores.user.init(),
        stores.friend.init(),
        stores.friendVerify.init(),
      ])
    },
  },
})
