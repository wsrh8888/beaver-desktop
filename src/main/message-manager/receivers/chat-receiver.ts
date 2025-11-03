import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { MessageService } from 'mainModule/database/services/chat/message'
import { ChatUserConversationService } from 'mainModule/database/services/chat/user-conversation'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

/**
 * @description: 聊天消息接收器 - 主进程版本
 */
export class ChatReceiver {
  // 消息缓存，避免重复处理
  private static messageCache = new Set<string>()
  private static readonly CACHE_SIZE = 1000 // 最多缓存1000条消息ID

  // 批处理队列
  private static messageBatch = new Map<string, any[]>()
  private static notificationTimer: NodeJS.Timeout | null = null
  private static readonly BATCH_DELAY = 1000 // 1秒批处理延迟
  private static readonly MAX_BATCH_SIZE = 100 // 最大批处理数量

  /**
   * @description: 处理聊天消息 - 主入口
   * @param {any} wsMessage - WebSocket消息
   */
  async handle(wsMessage: any) {
    const { data, messageId } = wsMessage
    logger.info({ text: '处理收到的hanle消息', data: {
      data,
      messageId,
    } }, 'ChatReceiver')

    // 检查消息是否已处理过
    if (messageId && ChatReceiver.messageCache.has(messageId)) {
      logger.info({ text: '跳过重复消息', data: { messageId } }, 'ChatReceiver')
      return
    }

    // 添加到缓存
    if (messageId) {
      ChatReceiver.addToCache(messageId)
    }

    // 根据消息类型进行处理
    switch (data?.type) {
      case 'private_message_receive':
        await this.handlePrivateMessageReceive(data)
        break
      case 'private_message_sync':
        await this.handlePrivateMessageReceive(data)
        break
      case 'group_message_receive':
        await this.handleGroupMessageReceive(data)
        break
      default:
        logger.warn({ text: '未支持的聊天消息类型', data: { type: data?.type, messageId } }, 'ChatReceiver')
    }
  }

  /**
   * 处理私聊消息接收
   */
  private async handlePrivateMessageReceive(messageData: any) {
    await this.processMessage(messageData, 'private')
  }

  /**
   * 处理群聊消息接收
   */
  private async handleGroupMessageReceive(messageData: any) {
    await this.processMessage(messageData, 'group')
  }

  /**
   * 统一的数据库存储逻辑
   */
  private async processMessage(messageData: any, messageType: 'private' | 'group') {
    const { messageId, conversationId, sender, msg, seq, createAt } = messageData

    try {
      // 构建消息数据
      const dbMessageData = {
        messageId: messageId || Date.now().toString(),
        conversationId,
        sendUserId: sender?.id || sender,
        msgType: this.parseMessageType(msg),
        msgPreview: this.extractMessagePreview(msg),
        msg: JSON.stringify(msg),
        seq: seq || 0,
        createdAt: createAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: 0,
      }

      // 存储消息到数据库（单个插入，性能可控）
      await MessageService.create(dbMessageData)

      // 更新会话的最后一条消息和时间
      await this.updateConversationLastMessage(conversationId, dbMessageData.msgPreview, sender)

      // 添加到批处理队列，用于合并通知
      this.addMessageToBatch(conversationId, {
        messageId: dbMessageData.messageId,
        conversationId,
        sender,
        msgType: dbMessageData.msgType,
        msgPreview: dbMessageData.msgPreview,
        seq: dbMessageData.seq,
        createAt: dbMessageData.createdAt,
      })

      logger.info({
        text: `${messageType === 'private' ? '私聊' : '群聊'}消息已存储`,
        data: { messageId: dbMessageData.messageId, type: messageType },
      }, 'ChatReceiver')
    }
    catch (error) {
      logger.error({
        text: `处理${messageType === 'private' ? '私聊' : '群聊'}消息失败`,
        data: { messageId, conversationId, error: (error as any)?.message },
      }, 'ChatReceiver')
    }
  }

  /**
   * 解析消息类型
   */
  private parseMessageType(msg: any): number {
    if (typeof msg === 'string')
      return 1 // 文本消息
    if (msg?.type)
      return msg.type
    return 1 // 默认文本消息
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
   * 更新会话的最后一条消息
   */
  private async updateConversationLastMessage(conversationId: string, lastMessage: string, _sender: any) {
    try {
      // 获取当前用户信息
      const userStore = store.get('userInfo')
      const currentUserId = userStore?.userId

      if (currentUserId) {
        await ChatUserConversationService.updateConversationLastMessage(currentUserId, conversationId, lastMessage)
        logger.info({
          text: '会话最后消息已更新',
          data: { conversationId, userId: currentUserId },
        }, 'ChatReceiver')
      }
      else {
        logger.warn({ text: '无法更新会话消息：用户信息不存在', data: { conversationId } }, 'ChatReceiver')
      }
    }
    catch (error) {
      logger.warn({
        text: '更新会话最后消息失败',
        data: { conversationId, error: (error as any)?.message },
      }, 'ChatReceiver')
    }
  }

  /**
   * 添加消息到批处理队列
   */
  private addMessageToBatch(conversationId: string, message: any) {
    if (!ChatReceiver.messageBatch.has(conversationId)) {
      ChatReceiver.messageBatch.set(conversationId, [])
    }

    const batch = ChatReceiver.messageBatch.get(conversationId)!
    batch.push(message)

    // 如果达到最大批处理数量，立即发送通知
    if (batch.length >= ChatReceiver.MAX_BATCH_SIZE) {
      this.sendBatchNotification(conversationId)
    }
    else {
      // 否则启动定时器
      this.scheduleBatchNotification()
    }
  }

  /**
   * 调度批处理通知
   */
  private scheduleBatchNotification() {
    if (ChatReceiver.notificationTimer) {
      return // 定时器已存在
    }

    ChatReceiver.notificationTimer = setTimeout(() => {
      // 发送所有会话的批处理通知
      for (const [conversationId] of ChatReceiver.messageBatch) {
        this.sendBatchNotification(conversationId)
      }
      ChatReceiver.notificationTimer = null
    }, ChatReceiver.BATCH_DELAY)
  }

  /**
   * 发送批处理通知
   */
  private sendBatchNotification(conversationId: string) {
    const batch = ChatReceiver.messageBatch.get(conversationId)
    if (!batch || batch.length === 0) {
      return
    }

    // 移除已处理的批次
    ChatReceiver.messageBatch.delete(conversationId)

    // 获取最新的消息序号范围
    const seqs = batch.map(msg => msg.seq).sort((a, b) => a - b)
    const minSeq = seqs[0]
    const maxSeq = seqs[seqs.length - 1]

    // 发送合并通知到render进程
    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.NEW_MESSAGES, {
      conversationId,
      messages: batch,
      seqRange: { min: minSeq, max: maxSeq },
      count: batch.length,
    })

    logger.info({
      text: '发送批处理消息通知',
      data: { conversationId, count: batch.length, seqRange: `${minSeq}-${maxSeq}` },
    }, 'ChatReceiver')
  }

  /**
   * 添加消息ID到缓存
   */
  private static addToCache(messageId: string) {
    // 如果缓存满了，移除最旧的
    // if (ChatReceiver.messageCache.size >= ChatReceiver.CACHE_SIZE) {
    //   const firstItem = ChatReceiver.messageCache.values().next().value
    //   ChatReceiver.messageCache.delete(firstItem)
    // }
    // ChatReceiver.messageCache.add(messageId)
    console.log('addToCache', messageId)
  }
}
