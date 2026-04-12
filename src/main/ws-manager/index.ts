import type { IWsData, WsType } from 'commonModule/type/ws/command'
import type { Buffer } from 'node:buffer'
import { getCurrentConfig } from 'commonModule/config'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'
import WebSocket from 'ws'
import { generateUserAgentIdentifier } from 'mainModule/utils/ua/index'

const logger = new Logger('WebSocket')

/**
 * @description: WebSocket配置选项
 */
interface WsConfig {
  reconnectInterval?: number // 重连间隔时间
  maxReconnectAttempts?: number // 最大重连次数
  heartbeatInterval?: number // 心跳间隔
}

/**
 * @description: WebSocket状态
 */
type WsStatus = 'connecting' | 'connected' | 'closed' | 'error'

/**
 * @description: WebSocket事件回调
 */
interface WsEventCallbacks {
  onMessage?(message: any): void
  onConnecting?(): void
  onConnect?(): void
  onDisconnect?(code?: number, reason?: Buffer): void
  onReconnectFailed?(): void
  onError?(error: any): void
}

interface WsMessage<T extends WsType = WsType> {
  command: string
  content: {
    timestamp: number
    messageId: string
    data: IWsData<T>
  }
}

/**
 * @description: WebSocket连接管理器 - 主进程版本
 */
class WsManager {
  private reconnectInterval: number
  private maxReconnectAttempts: number
  private heartbeatInterval: number
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null
  private isManualClose = false
  private eventCallbacks: WsEventCallbacks = {}

  private socket: WebSocket | null = null

  public isConnected = false
  public isClose = false
  public status: WsStatus = 'closed'

  constructor(config: WsConfig = {}) {
    this.reconnectInterval = config.reconnectInterval || 5000
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10
    this.heartbeatInterval = config.heartbeatInterval || 30000
  }

  /**
   * @description: 设置事件回调
   */
  public setEventCallbacks(callbacks: WsEventCallbacks) {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks }
  }

  async connect(): Promise<void> {
    const userInfo = store.get('userInfo')
    const token = userInfo?.token
    const userId = userInfo?.userId
    const wsUrl = getCurrentConfig().wsUrl

    // 防止重复连接
    if (this.isConnected || this.status === 'connecting') {
      return
    }
    logger.info({ text: '开始连接WebSocket', data: { userId } })

    this.status = 'connecting'

    if (!token) {
      this.status = 'closed'
      logger.warn({ text: '没有token，无法连接WebSocket' })
      return
    }

    logger.info({ text: '开始连接WebSocket', data: { userId } })
    this.isClose = false
    this.isManualClose = false

    if (this.eventCallbacks.onConnecting) {
      this.eventCallbacks.onConnecting()
    }

    try {
      // 深度对齐既有配置：使用 initCustom 中已加载的硬件指纹
      const deviceId = process.custom?.DEVICE_ID || ''
      const platform = 'windows'
      this.socket = new WebSocket(`${wsUrl}?token=${token}&userId=${userId}&platform=${platform}&deviceId=${deviceId}`, {
        headers: {
          'User-Agent': generateUserAgentIdentifier(),
        },
      })

      this.socket.on('open', () => {
        logger.info({ text: 'WebSocket连接成功' })
        this.isConnected = true
        this.status = 'connected'
        this.reconnectAttempts = 0
        this.clearTimers()
        this.startHeartbeat()

        if (this.eventCallbacks.onConnect) {
          this.eventCallbacks.onConnect()
        }
      })

      this.socket.on('close', (code, reason) => {
        const reasonStr = reason.toString()
        logger.info({ text: 'WebSocket连接关闭', data: { code, reason: reasonStr } })
        this.isConnected = false
        this.status = 'closed'
        this.clearTimers()

        if (this.eventCallbacks.onDisconnect) {
          this.eventCallbacks.onDisconnect(code, reason)
        }

        if (!this.isManualClose) {
          this.reconnect()
        }
      })

      this.socket.on('error', (error) => {
        logger.error({ text: 'WebSocket错误', data: { error: error.message } })
        this.isConnected = false
        this.status = 'error'

        // 核心逻辑：如果服务端返回 401 (Unauthorized)，说明 Token 彻底失效或 GUID 对不上
        // 此时必须立即停止重连，并清除本地状态，引导用户重新登录
        if (error.message.includes('401')) {
          logger.warn({ text: '检测到登录鉴权失效(401)，正在执行自动登出' })
          this.isManualClose = true // 标记为手动关闭，停止后续的自动重连
          // 使用动态 import 兼容 ESM，并解决循环依赖问题
          import('mainModule/ipc/render-to-main/auth').then((module) => {
            const authHandler = module.default
            authHandler.handleLogout()
          })
          return
        }

        if (this.eventCallbacks.onError) {
          this.eventCallbacks.onError(error)
        }
      })

      this.socket.on('message', (data) => {
        this.handleMessage(data.toString())
      })

      // 响应底层的 ping 帧 (ws 模块会自动处理，但我们可以增加业务层的双向心跳)
      this.socket.on('ping', () => {
        this.socket?.pong()
      })
    }
    catch (error) {
      logger.error({ text: 'WebSocket连接创建失败', data: { error: (error as any)?.message } })
      this.status = 'error'
      this.reconnect()
    }
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)
      const command = message.command

      // 1. 处理控制帧 (服务端发来的控制帧是扁平结构)
      if (command === 'PONG') {
        this.clearHeartbeatTimeout()
        return
      }

      if (command === 'PING') {
        this.sendPong(message.timestamp || Date.now())
        return
      }

      if (command === 'ACK') {
        logger.info({ text: '收到服务端回复(ACK)', data: { messageId: message.messageId } })
        return
      }

      // 2. 业务消息转发
      if (this.eventCallbacks.onMessage) {
        this.eventCallbacks.onMessage(message)
      }
    }
    catch (error) {
      logger.error({ text: '消息解析失败', data: { error: (error as any)?.message, raw: data } })
    }
  }

  private sendPong(timestamp: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        command: 'PONG',
        timestamp,
      }))
    }
  }

  /**
   * @description: 内部发送消息方法
   */
  public sendMessage(message: WsMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    }
    else {
      logger.warn({ text: '发送消息失败：WebSocket未连接' })
      throw new Error('WebSocket not ready')
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendPing()
    }, this.heartbeatInterval)
  }

  private sendPing() {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      // 客户端发出的 PING 需要符合 WsMessage 结构（带 content 层），因为服务端在 HandleWebSocketMessages 中解析
      const ping = {
        command: 'PING',
        content: {
          timestamp: Date.now(),
        },
      }

      try {
        this.socket.send(JSON.stringify(ping))

        // 设置心跳超时检查
        this.clearHeartbeatTimeout()
        this.heartbeatTimeoutTimer = setTimeout(() => {
          logger.warn({ text: '心跳超时(PONG未收到)，主动断开连接' })
          this.socket?.close()
        }, 15000) // 15秒超时
      }
      catch (error) {
        logger.error({ text: '发送心跳失败', data: { error: (error as any)?.message } })
      }
    }
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  private reconnect() {
    if (this.reconnectTimer) return

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error({ text: '达到最大重连次数，停止重连' })
      if (this.eventCallbacks.onReconnectFailed) {
        this.eventCallbacks.onReconnectFailed()
      }
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1), 30000)

    logger.info({ text: `第${this.reconnectAttempts}次重连，将在${Math.round(delay)}ms后尝试` })

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.clearHeartbeatTimeout()
  }

  /**
   * @description: 断开连接
   */
  public disconnect(): void {
    logger.info({ text: '手动断开WebSocket连接' })
    this.isManualClose = true
    this.clearTimers()

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.isConnected = false
    this.status = 'closed'
    this.reconnectAttempts = 0
  }

  /**
   * @description: 获取连接状态
   */
  public getStatus(): WsStatus {
    return this.status
  }
}

export default new WsManager()

