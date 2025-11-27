import type { GetWsMessageBody, WsType } from '../ws/command'

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
     * @description: 发送私聊消息
     */
    privateMessageSend(wsMessage: any): Promise<boolean>

    /**
     * @description: 发送群聊消息
     */
    groupMessageSend<T extends WsType>(
      conversationId: string,
      content: GetWsMessageBody<T>
    ): Promise<boolean>
  }
}
