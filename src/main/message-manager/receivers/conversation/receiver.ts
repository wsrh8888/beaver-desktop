import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import { BaseReceiver } from '../../base/base-receiver'

/**
 * 会话操作数据接口
 */
interface ConversationOperationData {
  operation: string
  conversationId: string
  userId: string
  data?: any
  timestamp: number
}

/**
 * @description: 会话操作接收器 - 处理会话相关的操作
 */
export class ConversationReceiver extends BaseReceiver<ConversationOperationData> {
  protected readonly receiverName = 'ConversationReceiver'

  constructor() {
    // 会话操作需要快速响应
    super({
      batchSize: 10, // 会话操作较少
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
        case 'conversation_delete':
          await this.handleConversationDelete(operationMessages)
          break
        case 'conversation_read':
          await this.handleConversationRead(operationMessages)
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
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

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

        // 创建用户会话关系
        await ChatUserConversationService.create({
          userId: currentUserId,
          conversationId: message.conversationId,
          joinedAt: message.timestamp,
          isHidden: 0,
          isPinned: 0,
          isMuted: 0,
          userReadSeq: 0,
          version: 1,
        })

        logger.info({
          text: '会话创建成功',
          data: { conversationId: message.conversationId, userId: currentUserId },
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

  /**
   * 处理会话删除
   */
  private async handleConversationDelete(messages: ConversationOperationData[]): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

    for (const message of messages) {
      try {
        // 软删除：将用户会话标记为隐藏
        await ChatUserConversationService.batchCreate([{
          userId: currentUserId,
          conversationId: message.conversationId,
          isHidden: 1,
          version: Date.now(),
        }])

        logger.info({
          text: '会话删除成功',
          data: { conversationId: message.conversationId, userId: currentUserId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话删除失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        }, this.receiverName)
      }
    }
  }

  /**
   * 处理会话已读
   */
  private async handleConversationRead(messages: ConversationOperationData[]): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

    for (const message of messages) {
      try {
        const readSeq = message.data?.readSeq || 0

        // 更新用户已读序列号
        await ChatUserConversationService.batchCreate([{
          userId: currentUserId,
          conversationId: message.conversationId,
          userReadSeq: readSeq,
          version: Date.now(),
        }])

        logger.info({
          text: '会话已读更新成功',
          data: { conversationId: message.conversationId, readSeq, userId: currentUserId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话已读更新失败',
          data: {
            conversationId: message.conversationId,
            error: (error as Error).message,
          },
        }, this.receiverName)
      }
    }
  }

  /**
   * 获取当前用户ID
   */
  private getCurrentUserId(): string | null {
    const userStore = store.get('userInfo')
    return userStore?.userId || null
  }
}
