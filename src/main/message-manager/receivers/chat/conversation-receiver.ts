import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import logger from 'mainModule/utils/log'
import { BaseReceiver } from '../../base/base-receiver'

/**
 * 会话操作数据接口
 */
interface ConversationOperationData {
  operation: string
  conversationId: string
  data?: any
  timestamp: number
}

/**
 * @description: 会话接收器 - 处理conversations表的操作
 */
export class ConversationReceiver extends BaseReceiver<ConversationOperationData> {
  protected readonly receiverName = 'ConversationReceiver'

  constructor() {
    // 会话操作需要快速响应
    super({
      batchSize: 5, // 会话操作较少
      delayMs: 100, // 快速响应
    })
  }

  /**
   * 批量处理会话操作
   */
  protected async processBatchMessages(messages: ConversationOperationData[]): Promise<void> {
    // 按操作类型分组处理
    const operations = new Map<string, ConversationOperationData[]>()

    for (const message of messages) {
      if (!operations.has(message.operation)) {
        operations.set(message.operation, [])
      }
      operations.get(message.operation)!.push(message)
    }

    // 逐个操作类型处理
    for (const [operation, operationMessages] of operations) {
      switch (operation) {
        case 'conversation_create':
          await this.handleConversationCreate(operationMessages)
          break
        case 'conversation_update':
          await this.handleConversationUpdate(operationMessages)
          break
        default:
          logger.warn({
            text: `未知的会话操作类型: ${operation}`,
            data: { operation, count: operationMessages.length },
          }, this.receiverName)
      }
    }
  }

  /**
   * 处理会话创建
   */
  private async handleConversationCreate(messages: ConversationOperationData[]): Promise<void> {
    for (const message of messages) {
      try {
        // 创建会话元数据
        await ChatConversationService.create({
          conversationId: message.conversationId,
          type: message.data?.type || 1,
          maxSeq: 0,
          lastMessage: '',
          version: 1,
        })

        logger.info({
          text: '会话创建成功',
          data: { conversationId: message.conversationId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话创建失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        }, this.receiverName)
      }
    }
  }

  /**
   * 处理会话更新
   */
  private async handleConversationUpdate(messages: ConversationOperationData[]): Promise<void> {
    for (const message of messages) {
      try {
        // 更新会话元数据
        if (message.data?.lastMessage) {
          await ChatConversationService.updateLastMessage(
            message.conversationId,
            message.data.lastMessage,
          )
        }

        logger.info({
          text: '会话更新成功',
          data: { conversationId: message.conversationId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话更新失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        }, this.receiverName)
      }
    }
  }
}
