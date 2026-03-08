import type { IChatMessageSendBody } from '../ws/message-types'

/**
 * @description: WebSocket模块接口
 */
export interface IWebSocketModule {
  /**
   * @description: 连接WebSocket
   */
  connect(userId: string, deviceId: string): Promise<boolean>

  /**
   * @description: 断开WebSocket连接
   */
  disconnect(): Promise<void>

  /**
   * @description: 重新连接WebSocket
   */
  reconnect(): Promise<boolean>

  chat: {
    /**
     * @description: 发送聊天消息 (统一通道)
     */
    sendMessage(data: IChatMessageSendBody): Promise<boolean>
  }
}
