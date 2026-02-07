import { defineStore } from 'pinia'

/**
 * @description: 通话模块 Store - 仅存储基础元数据和状态
 */
export const usecallStore = defineStore('usecallStore', {
  state: () => ({
    roomId: '',
    token: '',
    callType: 1, // 1-语音, 2-视频
    targetId: '',
    targetName: '未知用户',
    targetAvatar: '',
    role: 'caller', // caller or callee
    isConnected: false,
    isIncoming: false,
    isMuted: false,
    isCameraOff: false,
  }),

  getters: {
    statusText(state) {
      if (state.isConnected) return '通话中'
      if (state.isIncoming) return '邀请你通话...'
      return '正在呼叫...'
    },
  },

  actions: {
    /**
     * 更新通话元数据
     */
    setCallInfo(info: any) {
      this.roomId = info.roomId || ''
      this.token = info.token || ''
      this.callType = Number(info.callType) || 1
      this.targetId = info.targetId || ''
      this.targetName = info.targetName || '未知用户'
      this.targetAvatar = info.targetAvatar || ''
      this.role = info.role || 'caller'
      this.isIncoming = (this.role === 'callee')
    },

    /**
     * 重置状态
     */
    reset() {
      this.isConnected = false
      this.isIncoming = false
    },
  },
})
