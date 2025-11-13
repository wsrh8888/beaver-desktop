import type { IDBChatMessage } from 'commonModule/type/database/chat'
import type { IPrivateMessageReceiveBody, IPrivateMessageSyncBody } from 'commonModule/type/ws/message-types'
import { SendStatus } from 'commonModule/type/database/chat'
import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { MessageService } from 'mainModule/database/services/chat/message'
import { messageBusiness } from 'mainModule/business/chat/message'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'
import { BaseReceiver } from '../../base/base-receiver'

/**
 * @description: 消息接收器 - 处理messages表的操作
 */
export class MessageReceiver extends BaseReceiver<IDBChatMessage> {
  protected readonly receiverName = 'MessageReceiver'

  constructor() {
    super({
      batchSize: 50, // 每次批量处理50条消息
      delayMs: 500, // 500ms延迟处理
    })
  }

  /**
   * 主入口 - 处理消息接收
   */
  async handle(wsMessage: any) {
    const { data } = wsMessage
    console.log('11111111111111111111111')
    console.log('11111111111111111111111')
    console.log('11111111111111111111111')
    console.log('11111111111111111111111')
    console.log('11111111111111111111111')
    console.log('11111111111111111111111')
    console.log('11111111111111111111111')
    console.log('data', JSON.stringify(data))

    switch (data?.type) {
      case 'private_message_receive':
      case 'private_message_sync':
        // 统一处理消息接收，消息状态确认通过前端拉取数据时自动完成
        await super.handle(data.body)
        break
      default:
        logger.warn({ text: '未知消息类型', data: { type: data?.type } }, this.receiverName)
    }
  }

  /**
   * 预处理消息 - 将原始消息转换为数据库格式
   */
  protected async preProcessMessage(messageBody: IPrivateMessageReceiveBody | IPrivateMessageSyncBody): Promise<IDBChatMessage> {
    return {
      messageId: messageBody.messageId,
      conversationId: messageBody.conversationId,
      conversationType: messageBody.conversationType,
      sendUserId: messageBody.sender?.userId,
      msgType: messageBody.msg.type,
      msgPreview: messageBody.msgPreview,
      msg: JSON.stringify(this.transformMessageMsg(messageBody.msg)),
      seq: messageBody.seq,
      createdAt: Math.floor(new Date(messageBody.createAt).getTime() / 1000), // 转换为时间戳
      updatedAt: Math.floor(Date.now() / 1000), // 使用当前时间戳
    }
  }

  /**
   * 批量处理消息 - 插入messages表并更新会话
   */
  protected async processBatchMessages(messages: IDBChatMessage[]): Promise<void> {
    // 1. 批量插入消息
    const dbMessages = messages.map(msg => ({
      messageId: msg.messageId,
      conversationId: msg.conversationId,
      conversationType: msg.conversationType,
      sendUserId: msg.sendUserId,
      msgType: msg.msgType,
      msgPreview: msg.msgPreview,
      msg: msg.msg,
      seq: msg.seq || 0,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }))
    console.log('cccccccccccccccccccccccccc')
    console.log('cccccccccccccccccccccccccc')
    console.log('cccccccccccccccccccccccccc')
    console.log('cccccccccccccccccccccccccc')
    console.log('cccccccccccccccccccccccccc')
    console.log('cccccccccccccccccccccccccc')
    console.log('dbMessages', JSON.stringify(dbMessages))

    await MessageService.batchCreate(dbMessages)

    // 2. 更新当前用户发送的消息的send_status为"已发送"，同时更新seq值
    // 当收到服务器推送的消息时，如果本地已存在该消息（之前发送的），需要更新其状态和seq
    const currentUserId = store.get('userInfo')?.userId
    if (currentUserId) {
      // 筛选出当前用户发送的消息
      const currentUserMessages = messages.filter(msg => msg.sendUserId === currentUserId)
      const currentUserMessageIds = currentUserMessages.map(msg => msg.messageId)

      if (currentUserMessageIds.length > 0) {
        // 构建 messageId -> seq 的映射
        const seqMap = new Map<string, number>()
        for (const msg of currentUserMessages) {
          if (msg.seq !== undefined && msg.seq !== null) {
            seqMap.set(msg.messageId, msg.seq)
          }
        }

        // 批量更新这些消息的send_status为"已发送"，同时更新seq值
        await MessageService.batchUpdateSendStatus(currentUserMessageIds, SendStatus.SENT, seqMap)
      }
    }

    // 3. 批量更新会话最后消息（通过Business层）
    await messageBusiness.processNewMessages({ messages })
  }

  private transformMessageMsg(msg: any) {
    let newMsg = {
      type: msg.type,
      textMsg: undefined,
      imageMsg: undefined,
      videoMsg: undefined,
      fileMsg: undefined,
      voiceMsg: undefined,
      emojiMsg: undefined,
      replyMsg: undefined,
    }
    if (msg.type === 1) {
      newMsg.textMsg = msg.textMsg
    }
    return newMsg
  }

  /**
   * 通知前端 - 只发送数据范围，不发送完整数据
   * 前端收到通知后会主动拉取数据
   */
  protected notifyProcessed(messages: IDBChatMessage[]): void {
    const conversationGroups = new Map<string, { minSeq: number, maxSeq: number, count: number }>()

    // 按会话分组，计算seq范围
    for (const msg of messages) {
      const seq = msg.seq || 0
      const existing = conversationGroups.get(msg.conversationId)

      if (!existing) {
        conversationGroups.set(msg.conversationId, {
          minSeq: seq,
          maxSeq: seq,
          count: 1,
        })
      }
      else {
        existing.minSeq = Math.min(existing.minSeq, seq)
        existing.maxSeq = Math.max(existing.maxSeq, seq)
        existing.count++
      }
    }

    // 发送通知 - 只包含会话ID、seq范围和消息数量
    for (const [conversationId, range] of conversationGroups) {
      sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.NEW_MESSAGES, {
        conversationId,
        seqRange: { min: range.minSeq, max: range.maxSeq },
        count: range.count,
      })
    }
  }

  /**
   * 批量更新会话最后消息
   */
  private async batchUpdateConversationLastMessages(messages: IDBChatMessage[]): Promise<void> {
    const updates = new Map<string, { lastMessage: string, maxSeq: number, receivedAt: number }>()

    // 按会话分组，取最新消息和最大序列号
    for (const msg of messages) {
      // 使用消息预览或默认文本
      const preview = msg.msgPreview || '[消息]'

      if (!updates.has(msg.conversationId)
        || (msg.seq || 0) > updates.get(msg.conversationId)!.maxSeq) {
        updates.set(msg.conversationId, {
          lastMessage: preview,
          maxSeq: msg.seq || 0,
          receivedAt: msg.updatedAt || msg.createdAt || Math.floor(Date.now() / 1000),
        })
      }
    }

    // 批量更新会话元数据
    for (const [conversationId, update] of updates) {
      await ChatConversationService.updateLastMessage(conversationId, update.lastMessage, update.maxSeq)
    }

    // TODO: 考虑是否需要更新 chat_user_conversations 表
    // - 为发送者更新 userReadSeq
    // - 为接收者保持未读状态
    // 但这个逻辑可能需要在更上层的业务逻辑中处理
  }
}
