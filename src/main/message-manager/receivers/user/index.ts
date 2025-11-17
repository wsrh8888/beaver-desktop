import { UserReceiver } from './user'

/**
 * @description: 用户消息路由器
 * 根据消息类型路由到对应的接收器
 */
export class UserMessageRouter {
  private userReceiver = new UserReceiver()

  /**
   * 处理用户消息
   * @param wsMessage WebSocket 消息内容
   */
  async processUserMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      console.warn('用户消息缺少 type 字段', wsMessage)
      return
    }

    switch (data.type) {
      // 用户资料同步
      case 'user_receive':
        await this.userReceiver.handleTableUpdates(data.body)
        break

      default:
        console.warn('未知的用户消息类型', data.type)
    }
  }
}

// 导出单例实例
export const userMessageRouter = new UserMessageRouter()
