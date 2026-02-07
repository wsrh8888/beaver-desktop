import { Room, RoomEvent, VideoPresets } from 'livekit-client'
import { getCallTokenApi, hangupCallApi } from 'renderModule/api/call'
import { usecallStore } from '../pinia/call'

const logger = (window as any).logger?.('CallManager')

/**
 * @description: 通话核心管理类 - 负责 API 交互、LiveKit 驱动和生命周期控制
 */
export class CallManager {
  private room: Room | null = null
  private pendingTimer: NodeJS.Timeout | null = null // 呼叫超时计时器
  private connectionTimer: NodeJS.Timeout | null = null // 连接超时计时器

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
    })

    this.setupRoomListeners()
  }

  /**
   * 初始化入口
   */
  async initialize(params: any) {
    const callStore = usecallStore()
    // 1. 初始化基础数据
    callStore.setBaseInfo(params)

    logger?.info({ text: 'CallManager 初始化', data: params })

    // 2. 根据角色决定初始阶段
    if (params.role === 'caller') {
      // 拨打方
      callStore.setPhase('calling')

      // 现在主窗口已经预先请求了接口，params 中应该包含 roomInfo
      if (params.roomInfo) {
        callStore.setRoomInfo(params.roomInfo)
        // 自动连接 LiveKit
        await this.connect()
        this.startPendingTimer()
      } else {
        logger?.error({ text: '初始化失败：Caller 缺少 roomInfo' })
        // 异常处理：如果没有 roomInfo，可能是异常启动，关闭窗口
        electron.window.closeWindow('call')
      }

    } else if (params.role === 'callee') {
      // 被叫方 - 进入此窗口意味着已经点击了接听
      // 设置房间ID（如果有）
      if (params.roomId) {
        callStore.setRoomInfo({ roomId: params.roomId })
      }
      // 直接执行接听逻辑
      await this.acceptCall()
    }
  }

  /**
   * 接听通话 (Callee 调用)
   */
  async acceptCall() {
    const callStore = usecallStore()
    const { roomId } = callStore.roomInfo

    if (!roomId) {
      logger?.error({ text: '接听失败：缺少 roomId' })
      return
    }

    try {
      const res = await getCallTokenApi({ roomId })
      if (res.code === 0) {
        callStore.setRoomInfo(res.result)
        callStore.setPhase('active')
        await this.connect()
      } else {
        logger?.error({ text: '获取令牌失败', data: res })
        electron.window.closeWindow('call')
      }
    } catch (error) {
      logger?.error({ text: '接听通话异常', data: error })
      electron.window.closeWindow('call')
    }
  }

  /**
   * 连接到 LiveKit 房间
   */
  async connect() {
    const callStore = usecallStore()
    const { roomToken, liveKitUrl } = callStore.roomInfo

    if (!roomToken || !liveKitUrl) {
      logger.error({ text: '连接失败：缺少 token 或 url' })
      return
    }

    try {
      this.startConnectionTimer()
      await this.room?.connect(liveKitUrl, roomToken)
      this.clearConnectionTimer()

      // 连接成功后
      callStore.setPhase('active')
      this.clearPendingTimer()

      // 默认开启麦克风
      await this.room?.localParticipant.setMicrophoneEnabled(true)

      // 如果初始模式是视频，开启摄像头
      if (callStore.baseInfo.callMode === 'video') {
        this.toggleCamera(true)
      }

      logger?.info({ text: '成功连接到房间', data: this.room?.name })
    } catch (error) {
      logger?.error({ text: '连接 LiveKit 异常', data: error })
      this.cleanup()
    }
  }

  /**
   * 挂断/拒绝通话
   */
  async hangup() {
    const callStore = usecallStore()
    const { roomId } = callStore.roomInfo

    // 1. 调用后端 API
    if (roomId) {
      try {
        await hangupCallApi({ roomId })
      } catch (e) {
        logger?.warn({ text: '调用挂断 API 失败', data: e })
      }
    }

    // 2. 清理资源
    this.cleanup()

    // 3. 关闭窗口
    electron.window.closeWindow('call')
  }

  /**
   * 切换静音
   */
  async toggleMute(muted?: boolean) {
    const callStore = usecallStore()
    const targetState = muted !== undefined ? muted : !callStore.callStatus.isMuted

    await this.room?.localParticipant.setMicrophoneEnabled(!targetState)
    callStore.toggleMute()
  }

  /**
   * 切换摄像头
   */
  async toggleCamera(enabled?: boolean) {
    const callStore = usecallStore()
    const targetState = enabled !== undefined ? enabled : callStore.callStatus.isCameraOff

    await this.room?.localParticipant.setCameraEnabled(targetState)
    callStore.toggleCamera()
  }

  private setupRoomListeners() {
    if (!this.room) return

    this.room
      .on(RoomEvent.ParticipantConnected, (participant) => {
        logger?.info({ text: '参与者加入', data: participant.identity })
        this.clearPendingTimer()
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        logger?.info({ text: '参与者离开', data: participant.identity })

        // 私聊中一方离开，自动挂断
        const callStore = usecallStore()
        if (callStore.baseInfo.callType === 'private') {
          this.hangup()
        }
      })
      .on(RoomEvent.Disconnected, () => {
        logger?.info({ text: '房间已断开' })
        this.cleanup()
      })
  }

  private startPendingTimer() {
    this.clearPendingTimer()
    this.pendingTimer = setTimeout(() => {
      logger?.info({ text: '呼叫超时' })
      this.hangup()
    }, 60000)
  }

  private clearPendingTimer() {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer)
      this.pendingTimer = null
    }
  }

  private startConnectionTimer() {
    this.clearConnectionTimer()
    this.connectionTimer = setTimeout(() => {
      logger?.error({ text: '连接超时' })
      this.cleanup()
      electron.window.closeWindow('call')
    }, 15000)
  }

  private clearConnectionTimer() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = null
    }
  }

  private cleanup() {
    this.clearPendingTimer()
    this.clearConnectionTimer()

    if (this.room) {
      this.room.disconnect()
      this.room.removeAllListeners()
    }

    const callStore = usecallStore()
    callStore.reset()
  }

  public getRoom() {
    return this.room
  }
}

export default new CallManager()
