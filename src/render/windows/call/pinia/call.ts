import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'
import { useContactStore } from './contact'
import { useUserStore } from './user'

const logger = new Logger('CallStore')

/** 成员项：唯一事实来源，包含展示信息 + 轨道 + 本成员的静音/摄像头状态 */
export type CallMember = {
  userId: string
  nickName: string
  avatar: string
  /** 成员状态：calling 呼叫中/等待接听，joined 已进房，left 已离开，rejected 已拒绝，busy 忙碌占线 */
  status: 'calling' | 'joined' | 'left' | 'rejected' | 'busy'
  /** 远程视频轨道 SID（LiveKit），仅远程有；本地轨道不用 sid */
  sid?: string
  /** 视频轨道（本地/远程共用，markRaw） */
  track?: any
  /** 该成员是否静音（本地/远程都用此字段） */
  isMuted?: boolean
  /** 该成员是否关闭摄像头（本地/远程都用此字段；远程无 track 时也可视为关） */
  isCameraOff?: boolean
}

/**
 * @description: 通话模块 Store - 仅存储基础元数据和状态
 */
export const usecallStore = defineStore('usecallStore', {
  state: () => ({
    /** 通话基础信息：模式、主叫、会话、类型、角色 */
    baseInfo: {
      callMode: '' as 'audio' | 'video' | '',
      callerId: '' as string,
      conversationId: '' as string,
      callType: '' as 'private' | 'group' | '',
      role: '' as 'caller' | 'callee' | '',
      roomName: '' as string
    },
    /** 房间信息：roomId、token、LiveKit 地址、创建者 ID */
    roomInfo: {
      roomId: '',
      roomToken: '',
      liveKitUrl: '',
      creatorId: '',
    },
    /** 成员列表：驱动 UI 网格的单一事实来源，每项含 userId + 展示信息 + 轨道 + 静音/摄像头 */
    members: [] as CallMember[],
  }),

  actions: {
    /** 更新或新增成员；新成员会异步拉取 nickName/avatar */
    async upsertMember(id: string | number, patch: Partial<CallMember> = {}) {
      const userId = String(id)
      if (!userId) return

      const userStore = useUserStore()
      let member = this.members.find(m => String(m.userId) === userId)

      const isNew = !member
      if (isNew) {
        console.error('2222222222222', userId, this.members)
        await userStore.init()
        member = {
          userId,
          nickName: userId,
          avatar: '',
          status: 'calling',
          isMuted: true,
          isCameraOff: true,
        }
        this.members.push(member)
      }

      Object.assign(member!, patch)
      if (isNew) {
        this.fetchMemberMetadata(userId)
      }
    },

    /** 初始化成员列表并清空原列表；participants 可为 userId 字符串数组或带 userId/status 的对象数组 */
    async initMembers(participants: any[] = []) {
      this.members = []
      const userStore = useUserStore()
      await userStore.init()

      const statusMap: Record<number, CallMember['status']> = {
        1: 'calling',
        2: 'joined',
        3: 'rejected',
        4: 'busy',
        5: 'left'
      }

      participants.forEach(p => {
        const id = typeof p === 'string' ? p : p.userId
        if (!id) return
        const userId = String(id)

        const isSelf = userId === String(userStore.getUserId)
        let incomingStatus: CallMember['status'] = 'calling'
        if (typeof p === 'object' && p.status !== undefined) {
          incomingStatus = statusMap[p.status as number] || 'calling'
        }

        this.upsertMember(userId, { status: isSelf ? 'joined' : incomingStatus })
      })
    },

    /** 从 contact 拉取该成员的 nickName、avatar 并写回 member（内部由 upsertMember 触发） */
    async fetchMemberMetadata(id: string | number) {
      const userId = String(id)
      const userStore = useUserStore()
      const contactStore = useContactStore()
      await userStore.init()
      const isMe = userId === String(userStore.getUserId)
      const member = this.members.find(m => String(m.userId) === userId)
      if (!member) return

      try {
        if (isMe) {
          await contactStore.updateContactsByIds([userId])
          const me = userStore.getUserInfo
          if (me?.userId) {
            member.nickName = me.nickName || userId
            member.avatar = me.avatar || ''
          }
        } else {
          await contactStore.updateContactsByIds([userId])
          const contact = contactStore.getContact(userId)
          if (contact?.userId) {
            member.nickName = contact.nickName || userId
            member.avatar = contact.avatar || ''
          }
        }
      } catch (e) {
        logger.error({ text: '加载元数据失败', data: { userId, e } })
      }
    },

    /** 设置通话基础信息（整块覆盖） */
    setBaseInfo(baseInfo: any) {
      this.baseInfo = baseInfo
    },

    /** 设置房间信息（整块覆盖） */
    setRoomInfo(roomInfo: any) {
      this.roomInfo = roomInfo
    },

    /** 按 userId 更新成员，透传 patch；若成员不存在则先 upsert 再赋值 */
    async updateMemberByUserId(id: string | number, patch: Partial<CallMember>) {
      const userId = String(id)
      let member = this.members.find(m => String(m.userId) === userId)
      if (!member) {
        await this.upsertMember(userId, { status: 'joined' })
        member = this.members.find(m => String(m.userId) === userId)
      }
      if (member) Object.assign(member, patch)
    },

    /** 按轨道 sid 更新对应成员，透传 patch（用于远程轨道 mute/unmute、移除等） */
    updateMemberBySid(sid: string, patch: Partial<CallMember>) {
      const member = this.members.find(m => m.sid === sid)
      if (member) Object.assign(member, patch)
    },
  },
})
