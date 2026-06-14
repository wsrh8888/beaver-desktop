import type { IWsData, WsType } from 'commonModule/type/ws/command'
import type { Buffer } from 'node:buffer'
import { getCurrentConfig } from 'commonModule/config'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'
import { generateUserAgentIdentifier } from 'mainModule/utils/ua'

import WebSocket from 'ws'

const logger = new Logger('WebSocket')

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      code: (error as NodeJS.ErrnoException).code,
    }
  }
  return { message: String(error) }
}

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

interface WsControlFrame {
  command: string
  messageId?: string
  timestamp?: number
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
    const wsUrl = `${getCurrentConfig().baseUrl}/api/ws/v1/ws`

    // 防止重复连接
    if (this.isConnected || this.status === 'connecting') {
      return
    }
    if (!token || !userId) {
      logger.warn({ text: '没有token或userId，无法连接WebSocket' })
      return
    }

    logger.info({ text: '开始连接WebSocket', data: { userId } })
    this.status = 'connecting'
    this.isClose = false
    this.isManualClose = false

    if (this.eventCallbacks.onConnecting) {
      this.eventCallbacks.onConnecting()
    }

    try {
      const deviceId = process.custom.DEVICE_ID

      const params = new URLSearchParams({
        token,
        userId,
        platform: process.custom.PLATFORM,
        deviceId,
      })

      const userAgent = generateUserAgentIdentifier()

      logger.info({ text: 'WebSocket连接地址', data: { wsUrl, userId } })

      this.socket = new WebSocket(`${wsUrl}?${params.toString()}`, {
        headers: {
          'User-Agent': userAgent,
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
        const reasonText = reason.toString()
        logger.info({
          text: 'WebSocket连接关闭',
          data: {
            code,
            reason: reasonText,
            hint: code === 1006 ? '异常关闭，常见原因：HTTP 404/502 导致握手失败' : undefined,
          },
        })
        this.isConnected = false
        this.status = 'closed'
        this.clearTimers()

        if (this.eventCallbacks.onDisconnect) {
          this.eventCallbacks.onDisconnect(code, reason)
        }

        if (!this.isManualClose) {
          setTimeout(() => {
            this.reconnect()
          }, this.reconnectInterval)
        }
      })

      this.socket.on('error', (error) => {
        logger.error({ text: 'WebSocket错误', data: formatError(error) })
        this.isConnected = false
        this.status = 'error'

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
      logger.error({ text: 'WebSocket连接失败', data: formatError(error) })
      this.status = 'error'
      this.reconnect()
    }
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data) as WsControlFrame & WsMessage

      // 控制帧：PONG（扁平 JSON，服务端回复客户端 PING）
      if (message.command === 'PONG') {
        this.clearHeartbeatTimeout()
        return
      }

      // 控制帧：PING（扁平 JSON，服务端主动 ping，客户端回 PONG）
      if (message.command === 'PING' && !message.content) {
        this.sendControlFrame({
          command: 'PONG',
          timestamp: message.timestamp ?? Date.now(),
        })
        return
      }

      // 业务帧 / ACK 交给 MessageManager
      if (this.eventCallbacks.onMessage) {
        if (message.command !== 'ACK') {
          logger.info({
            text: '收到WebSocket消息',
            data: message,
          })
        }
        this.eventCallbacks.onMessage(message)
      }
    }
    catch (error) {
      logger.error({ text: '消息解析失败', data: formatError(error) })
    }
  }

  /**
   * @description: 统一发送入口，所有出站数据经此方法
   */
  private send(data: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false
    }

    logger.info({ text: '发送WebSocket数据', data })
    this.socket.send(data)
    return true
  }

  /**
   * @description: 发送控制帧（PONG 等扁平 JSON，无 content 层）
   */
  private sendControlFrame(frame: WsControlFrame): void {
    this.send(JSON.stringify(frame))
  }

  /**
   * @description: 发送业务消息
   */
  public sendMessage(message: WsMessage): void {
    try {
      if (!this.send(JSON.stringify(message))) {
        throw new Error('WebSocket not ready')
      }
    }
    catch (error) {
      logger.error({ text: '发送消息异常', data: formatError(error) })
      throw error
    }
  }

  private startHeartbeat() {
    this.sendHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.heartbeatInterval)
  }

  private sendHeartbeat() {
    if (!this.isConnected) {
      return
    }

    const timestamp = Date.now()
    // 服务端 enter.go 从 content.timestamp 读取 PING
    const ping = {
      command: 'PING',
      content: {
        timestamp,
        messageId: '',
        data: {},
      },
    }

    try {
      if (!this.send(JSON.stringify(ping))) {
        return
      }

      this.clearHeartbeatTimeout()
      this.heartbeatTimeoutTimer = setTimeout(() => {
        logger.warn({ text: '心跳超时，可能连接已断开' })
        if (this.socket) {
          this.socket.close()
        }
      }, 10000)
    }
    catch (error) {
      logger.error({ text: '发送心跳失败', data: formatError(error) })
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
