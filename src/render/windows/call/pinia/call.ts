import { defineStore } from 'pinia'

/**
 * @description: 通话模块 Store - 仅存储基础元数据和状态
 */
export const usecallStore = defineStore('usecallStore', {
  state: () => ({
    // 基础数据
    baseInfo: {
      callMode: '' as 'audio' | 'video' | '',  // 通话模式
      targetId: [] as string[],                // 目标ID列表
      callerId: '' as string,                  // 发起者ID
      conversationId: '' as string,            // 会话ID
      callType: '' as 'private' | 'group' | '', // 通话类型
      role: '' as 'caller' | 'callee' | ''     // 角色：呼叫者/被叫者
    },
    // 房间信息
    roomInfo: {
      roomId: '',
      roomToken: '',
      liveKitUrl: '',
    },
    // 实时状态控制
    callStatus: {
      phase: 'calling' as 'calling' | 'incoming' | 'active', // calling-呼叫中(拨打方), incoming-待接听(接收方), active-通话中
      isMuted: false,
      isCameraOff: true,  // 默认不开启摄像头
    },
  }),

  getters: {
  },

  actions: {
    /**
     * 设置基础数据
     */
    setBaseInfo(info: any) {
      console.error('setBaseInfo', info)
      this.baseInfo = info
      // 如果进入的是视频通话模式，可以在这里决定是否默认开启
      // 不过根据用户要求，默认进来可能都是语音/关闭摄像头状态
      if (info.callMode === 'video') {
        // this.callStatus.isCameraOff = false // 如果需要默认开启可以取消注释
      }
    },

    /**
     * 切换静音
     */
    toggleMute(val?: boolean) {
      this.callStatus.isMuted = val !== undefined ? val : !this.callStatus.isMuted
    },

    /**
     * 切换摄像头
     */
    toggleCamera(val?: boolean) {
      this.callStatus.isCameraOff = val !== undefined ? val : !this.callStatus.isCameraOff
    },

    /**
     * 设置房间信息
     */
    setRoomInfo(info: { roomId?: string, roomToken?: string, liveKitUrl?: string }) {
      if (info.roomId) this.roomInfo.roomId = info.roomId
      if (info.roomToken) this.roomInfo.roomToken = info.roomToken
      if (info.liveKitUrl) this.roomInfo.liveKitUrl = info.liveKitUrl
    },

    /**
     * 重置状态
     */
    reset() {
      this.baseInfo = {
        callMode: '',
        targetId: [],
        callerId: '',
        conversationId: '',
        callType: '',
        role: ''
      }
      this.roomInfo = {
        roomId: '',
        roomToken: '',
        liveKitUrl: ''
      }
      this.callStatus = {
        phase: 'calling',
        isMuted: false,
        isCameraOff: true
      }
    },

    /**
     * 设置通话阶段
     */
    setPhase(phase: 'calling' | 'incoming' | 'active') {
      this.callStatus.phase = phase
    },
  },
})
