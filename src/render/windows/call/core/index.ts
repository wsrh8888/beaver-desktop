import { Room, RoomEvent, VideoPresets, Track } from 'livekit-client'
import { markRaw } from 'vue'
import { hangupCallApi } from 'renderModule/api/call'
import { usecallStore } from '../pinia/call'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('CallManager')

/**
 * @description: 通话核心管理类 - 负责 API 交互、LiveKit 驱动和生命周期控制
 */
export class CallManager {
  private room: Room | null = null

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h1080.resolution,
      },
    })

    this.setupRoomListeners()
  }

  /**
   * 连接到 LiveKit 房间
   */
  async initialize() {
    const callStore = usecallStore()
    const { roomToken, liveKitUrl } = callStore.roomInfo

    try {
      logger.info({ text: '开始连接 LiveKit 房间', data: { liveKitUrl, roomToken } })

      // 1. 开始连接
      await this.room?.connect(liveKitUrl, roomToken)

      // 2. 将本地用户加入在线列表
      if (this.room?.localParticipant) {
        callStore.myUserId = this.room.localParticipant.identity
        callStore.upsertMember(this.room.localParticipant.identity, { status: 'joined' })
      }



      // 3. 同步存量参与者和轨道
      this.syncExistingParticipants()


      // 等待核心通道就绪后再执行媒体推流
      setTimeout(async () => {
        if (this.room?.state !== 'connected') return

        try {
          const isVideoCall = callStore.baseInfo.callMode === 'video'

          // 1. 默认开启麦克风
          await this.room.localParticipant.setMicrophoneEnabled(true)
          callStore.toggleMute(false)

          // 2. 如果是视频通话，自动开启摄像头
          if (isVideoCall) {
            await this.room.localParticipant.setCameraEnabled(true)
            callStore.toggleCamera(false) // isCameraOff = false
          }
        } catch (mediaError) {
          logger.warn({ text: '初始媒体发布失败', data: mediaError })
        }
      }, 500)

      logger.info({ text: '成功连接到房间', data: this.room?.name })
    } catch (error) {
      logger.error({ text: '连接 LiveKit 异常', data: error })
    }
  }

  /**
   * 挂断/拒绝通话
   */
  async hangup() {
    const callStore = usecallStore()
    const { roomId } = callStore.roomInfo
    await hangupCallApi({ roomId })
    // 3. 关闭窗口
    electron.window.closeWindow('call')
  }

  /**
   * 切换静音
   */
  async toggleMute() {
    const callStore = usecallStore()
    const targetState = !callStore.callStatus.isMuted

    if (this.room?.state !== 'connected') return

    try {
      await this.room.localParticipant.setMicrophoneEnabled(!targetState)
      callStore.toggleMute(targetState)
    } catch (e) {
      logger.error({ text: '切换静音失败', data: e })
    }
  }

  /**
   * 切换摄像头
   */
  async toggleCamera() {
    const callStore = usecallStore()
    // 如果当前是关闭状态 (isCameraOff: true)，目标应该是开启 (enabled: true)
    const shouldEnable = callStore.callStatus.isCameraOff

    logger.info({
      text: '切换摄像头', data: {
        currentlyOff: callStore.callStatus.isCameraOff,
        targetEnabled: shouldEnable
      }
    })

    if (this.room?.state !== 'connected') {
      logger.error({ text: '切换摄像头失败：房间未连接' })
      return
    }

    try {
      // 1. 物理设备开关
      await this.room.localParticipant.setCameraEnabled(shouldEnable)

      // 2. 同步 UI 状态：如果开启成功，isCameraOff 应该为 !shouldEnable
      callStore.toggleCamera(!shouldEnable)
    } catch (error: any) {
      logger.error({
        text: error.name === 'NotReadableError' ? '无法访问摄像头' : '切换摄像头异常',
        data: error
      })
      callStore.toggleCamera(true) // 失败则重置为关闭状态
    }
  }

  /**
   * 同步存量参与者和轨道
   */
  private syncExistingParticipants() {
    if (!this.room) return

    const callStore = usecallStore()
    this.room.remoteParticipants.forEach((participant) => {
      // 1. 更新成员
      callStore.upsertMember(participant.identity, { status: 'joined' })
      // 2. 触发参与者信息加载

      participant.trackPublications.forEach((pub) => {
        if (pub.kind === Track.Kind.Video && pub.track) {
          callStore.addRemoteVideoTrack({
            sid: pub.trackSid,
            identity: participant.identity,
            track: markRaw(pub.track),
            isMuted: pub.isMuted
          })
        }
      })
    })
  }

  private setupRoomListeners() {
    if (!this.room) return

    this.room
      .on(RoomEvent.Connected, () => {
        logger.info({ text: 'LiveKit Room Connected Event fired' })
      })
      .on(RoomEvent.ParticipantConnected, (participant) => {
        logger.info({ text: '参与者加入', data: participant.identity })
        const callStore = usecallStore()

        // 1. 更新成员
        callStore.upsertMember(participant.identity, { status: 'joined' })
        // 2. 通话接通
        callStore.setPhase('active')
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        logger.info({ text: '参与者离开', data: participant.identity })
        const callStore = usecallStore()

        // 1. 更新成员状态
        callStore.upsertMember(participant.identity, { status: 'left' })

        // 私聊中一方离开，自动挂断
        if (callStore.baseInfo.callType === 'private') {
          this.hangup()
        }
      })
      .on(RoomEvent.Disconnected, () => {
        logger.info({ text: '房间已断开' })
        const callStore = usecallStore()
        // 全员标记为离开 (或者根据业务需求处理)
        callStore.members.forEach(m => {
          if (m.userId !== 'me' && m.userId !== callStore.myUserId) {
            callStore.upsertMember(m.userId, { status: 'left' })
          }
        })
      })
      // 订阅远程轨道
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          usecallStore().addRemoteVideoTrack({
            sid: track.sid || publication.trackSid,
            identity: participant.identity,
            track: markRaw(track),
            isMuted: publication.isMuted
          })
        }
      })
      // 轨道状态同步 (关键：支持 A 开启/关闭视频时 B 能实时切换 UI)
      .on(RoomEvent.TrackMuted, (publication) => {
        if (publication.kind === Track.Kind.Video) {
          usecallStore().updateRemoteTrackMute(publication.trackSid, true)
        }
      })
      .on(RoomEvent.TrackUnmuted, (publication) => {
        if (publication.kind === Track.Kind.Video) {
          usecallStore().updateRemoteTrackMute(publication.trackSid, false)
        }
      })
      // 取消订阅远程轨道
      .on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
        usecallStore().removeRemoteVideoTrack(publication.trackSid)
      })
      // 轨道取消发布 (A 彻底关闭了摄像头)
      .on(RoomEvent.TrackUnpublished, (publication) => {
        usecallStore().removeRemoteVideoTrack(publication.trackSid)
      })
      // 本地轨道发布
      .on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.kind === Track.Kind.Video && publication.track) {
          usecallStore().setLocalVideoTrack(markRaw(publication.track))
        }
      })
      // 本地轨道取消发布
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.kind === Track.Kind.Video) {
          usecallStore().setLocalVideoTrack(null)
        }
      })
  }
}

export default new CallManager()
