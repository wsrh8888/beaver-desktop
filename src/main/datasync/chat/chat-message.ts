import { chatSyncApi } from 'mainModule/api/chat'
import { MessageService } from 'mainModule/database/services/chat/message'
import logger from 'mainModule/utils/log'

// 消息同步服务 - 专门负责按会话同步消息数据
class MessageSyncService {
  // 同步单个会话的消息
  async syncConversationMessages(
    conversationId: string,
    fromSeq: number,
    toSeq: number,
  ) {
    logger.info({
      text: '同步会话消息',
      data: {
        conversationId,
        fromSeq,
        toSeq,
      },
    }, 'MessageSyncService')

    await this.doSyncConversationMessages(
      conversationId,
      fromSeq,
      toSeq,
    )
  }

  // 执行单个会话的消息同步
  private async doSyncConversationMessages(
    conversationId: string,
    fromSeq: number,
    toSeq: number,
  ) {
    let currentSeq = fromSeq

    while (currentSeq <= toSeq) {
      const response = await chatSyncApi({
        conversationId, // 指定会话ID
        fromSeq: currentSeq,
        toSeq: Math.min(currentSeq + 99, toSeq),
        limit: 100,
      })

      if (response.result.messages && response.result.messages.length > 0) {
        const messages = response.result.messages.map(msg => ({
          messageId: msg.messageId,
          conversationId: msg.conversationId,
          conversationType: msg.conversationType,
          sendUserId: msg.sendUserId,
          msgType: msg.msgType,
          msgPreview: msg.msgPreview,
          msg: msg.msg,
          seq: msg.seq,
          createdAt: msg.createAt,
          updatedAt: Math.floor(Date.now() / 1000),
        }))

        await MessageService.batchCreate(messages)
        currentSeq = Math.min(currentSeq + 99, toSeq) + 1
      }
      else {
        break
      }
    }
  }
}

// 导出消息同步服务实例
export default new MessageSyncService()
