import type { IWsData, WsType } from 'commonModule/type/ws/command'
import type { Buffer } from 'node:buffer'
import { getCurrentConfig } from 'commonModule/config'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger/index'
import { v4 as uuidv4 } from 'uuid'

import WebSocket from 'ws'

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
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5
    this.heartbeatInterval = config.heartbeatInterval || 30000
  }

  /**
   * @description: 设置事件回调
   */
  public setEventCallbacks(callbacks: WsEventCallbacks) {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks }
  }

  async connect(): Promise<void> {
    const token = store.get('userInfo')?.token
    const wsUrl = getCurrentConfig().wsUrl
    // 防止重复连接
    if (this.isConnected || this.status === 'connecting') {
      logger.info({ text: 'WebSocket已经连接或正在连接中' })
      return
    }

    if (!token) {
      logger.warn({ text: '没有token，无法连接WebSocket' })
      return
    }

    logger.info({ text: '开始连接WebSocket' })
    this.status = 'connecting'
    this.isClose = false
    this.isManualClose = false

    // 触发开始连接回调
    if (this.eventCallbacks.onConnecting) {
      this.eventCallbacks.onConnecting()
    }

    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`)

      this.socket.on('open', () => {
        logger.info({ text: 'WebSocket连接成功' })
        this.isConnected = true
        this.status = 'connected'
        this.reconnectAttempts = 0
        this.clearTimers()
        this.startHeartbeat()

        // 触发连接成功回调
        if (this.eventCallbacks.onConnect) {
          this.eventCallbacks.onConnect()
        }
      })

      this.socket.on('close', (code, reason) => {
        logger.info({ text: 'WebSocket连接关闭', data: { code, reason: reason.toString() } })
        this.isConnected = false
        this.status = 'closed'
        this.clearTimers()

        // 触发断开连接回调
        if (this.eventCallbacks.onDisconnect) {
          this.eventCallbacks.onDisconnect()
        }

        if (!this.isManualClose) {
          setTimeout(() => {
            this.reconnect()
          }, this.reconnectInterval) // 最大延迟 30 秒
        }
      })

      this.socket.on('error', (error) => {
        logger.error({ text: 'WebSocket错误', data: { error } })
        this.isConnected = false
        this.status = 'error'

        // 触发错误回调
        if (this.eventCallbacks.onError) {
          this.eventCallbacks.onError(error)
        }
      })

      this.socket.on('message', (data) => {
        this.handleMessage(data.toString())
      })
    }
    catch (error) {
      logger.error({ text: 'WebSocket连接失败', data: { error: (error as any)?.message } })
      this.status = 'error'
      this.reconnect()
    }
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)

      // 处理心跳响应，清除心跳超时定时器
      if (message.command === 'HEARTBEAT') {
        this.clearHeartbeatTimeout()
        return
      }

      // 通过事件回调传递给业务层处理
      if (this.eventCallbacks.onMessage) {
        logger.info(({
          text: '收到WebSocket消息',
          data: message,
        }))
        this.eventCallbacks.onMessage(message)
      }
    }
    catch (error) {
      logger.error({ text: '消息解析失败', data: { error: (error as any)?.message } })
    }
  }

  /**
   * @description: 内部发送消息方法
   */
  public sendMessage(message: WsMessage): void {
    try {
      const messageStr = JSON.stringify(message)
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        logger.info({ text: '发送ws消息', data: messageStr })

        this.socket.send(messageStr)
      }
      else {
        throw new Error('WebSocket not ready')
      }
    }
    catch (error) {
      logger.error({ text: '发送消息异常', data: { error: (error as any)?.message } })
      throw error
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.heartbeatInterval)
  }

  private sendHeartbeat() {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      const heartbeat = {
        command: 'HEARTBEAT',
        content: {
          timestamp: Date.now(),
          messageId: uuidv4(),
          data: null,
        },
      }

      try {
        this.socket.send(JSON.stringify(heartbeat))

        // 设置心跳超时检查
        this.clearHeartbeatTimeout()
        this.heartbeatTimeoutTimer = setTimeout(() => {
          logger.warn({ text: '心跳超时，可能连接已断开' })
          if (this.socket) {
            this.socket.close()
          }
        }, 10000) // 10秒超时
      }
      catch (error) {
        logger.error({ text: '发送心跳失败', data: { error: (error as any)?.message } })
      }
    }
  }

  /**
   * @description: 清除心跳超时定时器
   */
  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.info({ text: '达到最大重连次数，停止重连' })

      // 通知前端：重连失败
      if (this.eventCallbacks.onReconnectFailed) {
        this.eventCallbacks.onReconnectFailed()
      }
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * this.reconnectAttempts

    logger.info({ text: `第${this.reconnectAttempts}次重连，延迟${delay}ms` })

    this.reconnectTimer = setTimeout(() => {
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
      if (this.isConnected) {
        this.socket.close()
      }
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
