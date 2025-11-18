import { FriendReceiver } from './receiver'
import { FriendVerifyReceiver } from './friend-verify-receiver'

/**
 * @description: 好友消息路由器
 * 根据消息类型路由到对应的接收器
 */
export class FriendMessageRouter {
  private friendReceiver = new FriendReceiver()
  private friendVerifyReceiver = new FriendVerifyReceiver()

  /**
   * 处理好友消息
   * @param wsMessage WebSocket 消息内容
   */
  async processFriendMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      console.warn('好友消息缺少 type 字段', wsMessage)
      return
    }

    switch (data.type) {
      // 好友信息同步
      case 'friend_receive':
        await this.friendReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 好友验证信息同步
      case 'friend_verify_receive':
        await this.friendVerifyReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        console.warn('未知的好友消息类型', data.type)
    }
  }
}

// 导出单例实例
export const friendMessageRouter = new FriendMessageRouter()
