import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { MessageService } from 'mainModule/database/services/chat/message'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import { BaseReceiver } from '../../base/base-receiver'

/**
 * 聊天消息数据接口
 */
interface ChatMessageData {
  messageId: string
  conversationId: string
  sender: any
  msg: any
  seq: number
  createAt: string
  _messageType: 'private' | 'group'
  _receivedAt: number
}

/**
 * @description: 消息接收器 - 处理messages表的操作
 */
export class MessageReceiver extends BaseReceiver<ChatMessageData> {
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

    switch (data?.type) {
      case 'private_message_receive':
      case 'private_message_sync':
      case 'group_message_receive':
        await super.handle({
          messageId: wsMessage.messageId,
          data: { ...data, _messageType: data.type.includes('private') ? 'private' : 'group' },
        })
        break
      default:
        logger.warn({ text: '未知消息类型', data: { type: data?.type } }, this.receiverName)
    }
  }

  /**
   * 预处理消息
   */
  protected async preProcessMessage(wsMessage: any): Promise<ChatMessageData> {
    return {
      ...wsMessage,
      _receivedAt: Date.now(),
    }
  }

  /**
   * 批量处理消息 - 插入messages表并更新会话
   */
  protected async processBatchMessages(messages: ChatMessageData[]): Promise<void> {
    // 1. 批量插入消息
    const dbMessages = messages.map(msg => ({
      messageId: msg.messageId || Date.now().toString(),
      conversationId: msg.conversationId,
      sendUserId: msg.sender?.id || msg.sender,
      msgType: this.parseMessageType(msg.msg),
      msgPreview: this.extractMessagePreview(msg.msg),
      msg: JSON.stringify(msg.msg),
      seq: msg.seq || 0,
      createdAt: msg.createAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    await MessageService.batchCreate(dbMessages)

    // 2. 批量更新会话最后消息
    await this.batchUpdateConversationLastMessages(messages)
  }

  /**
   * 通知前端
   */
  protected notifyProcessed(messages: ChatMessageData[]): void {
    const conversationGroups = new Map<string, any[]>()

    // 按会话分组
    for (const msg of messages) {
      if (!conversationGroups.has(msg.conversationId)) {
        conversationGroups.set(msg.conversationId, [])
      }

      conversationGroups.get(msg.conversationId)!.push({
        messageId: msg.messageId,
        conversationId: msg.conversationId,
        sender: msg.sender,
        msgType: this.parseMessageType(msg.msg),
        msgPreview: this.extractMessagePreview(msg.msg),
        seq: msg.seq,
        createAt: msg.createAt,
      })
    }

    // 发送通知
    for (const [conversationId, msgs] of conversationGroups) {
      const seqs = msgs.map(m => m.seq).sort((a, b) => a - b)
      sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.NEW_MESSAGES, {
        conversationId,
        messages: msgs,
        seqRange: { min: seqs[0], max: seqs[seqs.length - 1] },
        count: msgs.length,
      })
    }
  }

  /**
   * 解析消息类型
   */
  private parseMessageType(msg: any): number {
    if (typeof msg === 'string')
      return 1
    if (msg?.type)
      return msg.type
    return 1
  }

  /**
   * 提取消息预览
   */
  private extractMessagePreview(msg: any): string {
    if (typeof msg === 'string')
      return msg
    if (msg?.content)
      return msg.content
    if (msg?.text)
      return msg.text
    return '[消息]'
  }

  /**
   * 批量更新会话最后消息
   */
  private async batchUpdateConversationLastMessages(messages: ChatMessageData[]): Promise<void> {
    const updates = new Map<string, { lastMessage: string, maxSeq: number, receivedAt: number }>()

    // 按会话分组，取最新消息和最大序列号
    for (const msg of messages) {
      const preview = this.extractMessagePreview(msg.msg)
      if (!updates.has(msg.conversationId)
        || msg.seq > updates.get(msg.conversationId)!.maxSeq) {
        updates.set(msg.conversationId, {
          lastMessage: preview,
          maxSeq: msg.seq,
          receivedAt: msg._receivedAt,
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
