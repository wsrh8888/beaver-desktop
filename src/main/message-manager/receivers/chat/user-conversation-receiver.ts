import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import { BaseReceiver } from '../../base/base-receiver'

/**
 * 用户会话操作数据接口
 */
interface UserConversationOperationData {
  operation: string
  conversationId: string
  data?: any
  timestamp: number
}

/**
 * @description: 用户会话接收器 - 处理user_conversations表的操作
 */
export class UserConversationReceiver extends BaseReceiver<UserConversationOperationData> {
  protected readonly receiverName = 'UserConversationReceiver'

  constructor() {
    // 用户会话操作需要快速响应
    super({
      batchSize: 10, // 用户会话操作较多
      delayMs: 50, // 快速响应
    })
  }

  /**
   * 批量处理用户会话操作
   */
  protected async processBatchMessages(messages: UserConversationOperationData[]): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId)
      return

    // 按操作类型分组处理
    const operations = new Map<string, UserConversationOperationData[]>()

    for (const message of messages) {
      if (!operations.has(message.operation)) {
        operations.set(message.operation, [])
      }
      operations.get(message.operation)!.push(message)
    }

    // 逐个操作类型处理
    for (const [operation, operationMessages] of operations) {
      switch (operation) {
        case 'conversation_pin':
          await this.handleConversationPin(operationMessages, currentUserId)
          break
        case 'conversation_unpin':
          await this.handleConversationUnpin(operationMessages, currentUserId)
          break
        case 'conversation_read':
          await this.handleConversationRead(operationMessages, currentUserId)
          break
        case 'conversation_hide':
          await this.handleConversationHide(operationMessages, currentUserId)
          break
        case 'conversation_join':
          await this.handleConversationJoin(operationMessages, currentUserId)
          break
        default:
          logger.warn({
            text: `未知的用户会话操作类型: ${operation}`,
            data: { operation, count: operationMessages.length },
          }, this.receiverName)
      }
    }
  }

  /**
   * 处理会话置顶
   */
  private async handleConversationPin(messages: UserConversationOperationData[], userId: string): Promise<void> {
    for (const message of messages) {
      try {
        await ChatUserConversationService.batchCreate([{
          userId,
          conversationId: message.conversationId,
          isPinned: 1,
          version: Date.now(),
        }])

        logger.info({
          text: '会话置顶成功',
          data: { conversationId: message.conversationId, userId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话置顶失败',
          data: { conversationId: message.conversationId, error: (error as Error).message },
        }, this.receiverName)
      }
    }
  }

  /**
   * 处理取消会话置顶
   */
  private async handleConversationUnpin(messages: UserConversationOperationData[], userId: string): Promise<void> {
    for (const message of messages) {
      try {
        await ChatUserConversationService.batchCreate([{
          userId,
          conversationId: message.conversationId,
          isPinned: 0,
          version: Date.now(),
        }])

        logger.info({
          text: '取消会话置顶成功',
          data: { conversationId: message.conversationId, userId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '取消会话置顶失败',
          data: { conversationId: message.conversationId, error: (error as Error).message },
        }, this.receiverName)
      }
    }
  }

  /**
   * 处理会话已读
   */
  private async handleConversationRead(messages: UserConversationOperationData[], userId: string): Promise<void> {
    for (const message of messages) {
      try {
        const readSeq = message.data?.readSeq || 0

        await ChatUserConversationService.batchCreate([{
          userId,
          conversationId: message.conversationId,
          userReadSeq: readSeq,
          version: Date.now(),
        }])

        logger.info({
          text: '会话已读更新成功',
          data: { conversationId: message.conversationId, readSeq, userId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话已读更新失败',
          data: { conversationId: message.conversationId, error: (error as Error).message },
        }, this.receiverName)
      }
    }
  }

  /**
   * 处理会话隐藏
   */
  private async handleConversationHide(messages: UserConversationOperationData[], userId: string): Promise<void> {
    for (const message of messages) {
      try {
        await ChatUserConversationService.batchCreate([{
          userId,
          conversationId: message.conversationId,
          isHidden: 1,
          version: Date.now(),
        }])

        logger.info({
          text: '会话隐藏成功',
          data: { conversationId: message.conversationId, userId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '会话隐藏失败',
          data: { conversationId: message.conversationId, error: (error as Error).message },
        }, this.receiverName)
      }
    }
  }

  /**
   * 处理加入会话
   */
  private async handleConversationJoin(messages: UserConversationOperationData[], userId: string): Promise<void> {
    for (const message of messages) {
      try {
        await ChatUserConversationService.create({
          userId,
          conversationId: message.conversationId,
          joinedAt: message.timestamp,
          isHidden: 0,
          isPinned: 0,
          isMuted: 0,
          userReadSeq: 0,
          version: 1,
        })

        logger.info({
          text: '加入会话成功',
          data: { conversationId: message.conversationId, userId },
        }, this.receiverName)
      }
      catch (error) {
        logger.error({
          text: '加入会话失败',
          data: { conversationId: message.conversationId, error: (error as Error).message },
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
