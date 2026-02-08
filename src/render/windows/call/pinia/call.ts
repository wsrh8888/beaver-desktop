import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('CallStore')

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
    // 媒体轨道 (标记为 raw 以避免不必要的响应式开销)
    remoteVideoTracks: [] as Array<{
      sid: string,
      identity: string,
      track: any,
      isMuted: boolean
    }>,
    // 逻辑成员列表 (驱动 UI 网格的单一事实来源)
    members: [] as Array<{
      userId: string,
      nickName: string,
      avatar: string,
      status: 'calling' | 'joined' | 'left' | 'rejected' | 'busy'
    }>,
    localVideoTrack: null as any,
    // 本地用户的真实 ID (从 DB 获取)
    myUserId: '' as string,
  }),

  actions: {
    /**
     * 初始化自己的 ID (从数据库拿)
     */
    async initMyUserId() {
      if (this.myUserId) return
      try {
        const res = await (window as any).electron.database.user.getUserInfo()
        if (res?.userId) {
          this.myUserId = res.userId
        }
      } catch (e) {
        logger.error({ text: '获取当前用户信息失败', data: e })
      }
    },

    /**
     * 更新或新增成员 (中心化入口)
     * @param userId 用户 ID
     * @param patch 要更新的字段
     */
    async upsertMember(userId: string, patch: Partial<typeof usecallStore.prototype.members[number]> = {}) {
      if (!userId) return

      // 处理 'me' 占位符
      if (userId === 'me') {
        await this.initMyUserId()
        userId = this.myUserId
      }

      let member = this.members.find(m => m.userId === userId)

      const isNew = !member
      if (isNew) {
        member = {
          userId,
          nickName: userId,
          avatar: '',
          status: 'calling'
        }
        this.members.push(member)
      }

      // 合并更新字段
      Object.assign(member!, patch)

      // 如果是新成员，异步拉取元数据
      if (isNew) {
        this.fetchMemberMetadata(userId)
      }
    },

    /**
     * 初始化全员列表
     * @param participants 初始成员列表 (兼容 ID 数组或对象数组)
     */
    async initMembers(participants: any[] = []) {
      this.members = []
      await this.initMyUserId()

      participants.forEach(p => {
        const userId = typeof p === 'string' ? p : p.userId
        if (!userId) return

        const isSelf = userId === this.myUserId
        // 这里的关键：如果 p 是个对象，我们需要保留它真实的 status (calling/joined)
        const incomingStatus = (typeof p === 'object' && p.status) ? p.status : 'calling'

        this.upsertMember(userId, { status: isSelf ? 'joined' : incomingStatus })
      })
    },

    /**
     * 私有逻辑：从 DB 获取元数据
     */
    async fetchMemberMetadata(userId: string) {
      await this.initMyUserId()
      const isMe = userId === this.myUserId
      const member = this.members.find(m => m.userId === userId)
      if (!member) return

      try {
        let res: any
        if (isMe) {
          res = await (window as any).electron.database.user.getUserInfo()
        } else {
          const result = await (window as any).electron.database.user.getUsersBasicInfo({ userIds: [userId] })
          res = result?.users?.[0]
        }

        if (res && member) {
          member.nickName = res.nickName || userId
          member.avatar = res.avatar || ''
        }
      } catch (e) {
        logger.error({ text: '加载元数据失败', data: { userId, e } })
      }
    },

    /**
     * 设置基础数据
     */
    async setBaseInfo(info: any) {
      this.baseInfo = info
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
      logger.info({ text: '设置房间信息', data: info })
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
      this.localVideoTrack = null
      this.remoteVideoTracks = []
    },

    /**
     * 设置通话阶段
     */
    setPhase(phase: 'calling' | 'incoming' | 'active') {
      this.callStatus.phase = phase
    },

    setLocalVideoTrack(track: any) {
      this.localVideoTrack = track
    },

    addRemoteVideoTrack(payload: { sid: string, identity: string, track: any, isMuted?: boolean }) {
      const exists = this.remoteVideoTracks.some(t => t.sid === payload.sid)
      if (!exists) {
        this.remoteVideoTracks.push({
          ...payload,
          isMuted: payload.isMuted ?? false
        })
      }
    },

    updateRemoteTrackMute(sid: string, isMuted: boolean) {
      const track = this.remoteVideoTracks.find(t => t.sid === sid)
      if (track) {
        track.isMuted = isMuted
      }
    },

    removeRemoteVideoTrack(sid: string) {
      this.remoteVideoTracks = this.remoteVideoTracks.filter(t => t.sid !== sid)
    },
  },
})
