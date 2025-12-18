import logger from 'mainModule/utils/log'
import { CollectReceiver } from './collect-receiver'

/**
 * 表情消息路由器
 * 根据消息类型路由到对应的接收器
 */
class EmojiMessageRouter {
  private collectReceiver = new CollectReceiver()

  /**
   * 处理表情消息
   * @param wsMessage WebSocket 消息内容
   */
  async processEmojiMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: '表情消息缺少 type 字段', data: { wsMessage } }, 'EmojiMessageRouter')
      return
    }

    switch (data.type) {
      // 表情数据同步消息
      case 'emoji_receive':
        await this.collectReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的表情消息类型', data: { type: data.type } }, 'EmojiMessageRouter')
    }
  }
}

// 导出单例实例
export const emojiMessageRouter = new EmojiMessageRouter()
