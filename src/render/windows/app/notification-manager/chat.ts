import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'

const logger = new Logger('DatabaseChatEventManager')

class DatabaseChatEventManager {
  constructor() {
    // 绑定方法以保持 this 上下文
    this.handle = this.handle.bind(this)
  }

  init() {
    electron.notification.on(NotificationModule.DATABASE_CHAT, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.DATABASE_CHAT, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.DATABASE_CHAT>) {
    logger.info({
      text: '收到聊天表更新通知',
      data: params,
    })
    switch (params.command) {
      case NotificationChatCommand.CONVERSATION_UPDATE:
        this.handleConversationUpdate(params.data)
        break
      case NotificationChatCommand.MESSAGE_UPDATE:
        this.handleMessageUpdate(params.data)
        break
      case NotificationChatCommand.USER_CONVERSATION_UPDATE:
        this.handleUserConversationUpdate(params.data)
        break
      default:
        break
    }
  }

  /**
   * 处理会话表更新通知
   */
  private async handleConversationUpdate(data: any) {
    const { conversationIds, updates, timestamp } = data

    logger.info({
      text: `收到会话表更新通知，${conversationIds?.length || 0} 个会话`,
      data: { conversationIds, updates, timestamp },
    })

    try {
      const { useConversationStore } = await import('../pinia/conversation/conversation')
      const conversationStore = useConversationStore()

      if (updates && updates.length > 0) {
        // 有详细的变更数据，优先使用局部更新
        for (const update of updates) {
          await conversationStore.updateConversationByChange(update)
        }
      } else {
        // 没有详细数据，回退到重新获取
        for (const conversationId of conversationIds || []) {
          await conversationStore.initConversationById(conversationId)
        }
      }

      logger.info({
        text: `成功更新 ${conversationIds?.length || 0} 个会话`,
        data: { conversationIds },
      })
    }
    catch (error) {
      logger.error({
        text: '处理会话表更新失败',
        data: { conversationIds, error: (error as Error).message },
      })
    }
  }

  /**
   * 处理消息表更新通知
   */
  private async handleMessageUpdate(data: any) {
    const { tableUpdates } = data

    logger.info({
      text: '收到消息表更新通知',
      data: { tableUpdates },
    })

    try {
      if (tableUpdates && Array.isArray(tableUpdates)) {
        // 处理按表分组的批量更新
        for (const tableUpdate of tableUpdates) {
          await this.handleTableUpdate(tableUpdate)
        }
      } else {
        // 兼容旧格式
        logger.warn('收到旧格式的消息更新，将尝试按单表处理', { data })
        const { conversationUpdates } = data
        if (conversationUpdates && Array.isArray(conversationUpdates)) {
          for (const conversationUpdate of conversationUpdates) {
            await this.handleConversationUpdate(conversationUpdate)
          }
        } else {
          await this.handleTableUpdate(data)
        }
      }

      logger.info({
        text: `成功处理消息更新，${tableUpdates?.length || 1} 个表更新`,
      })
    }
    catch (error) {
      logger.error({
        text: '处理消息表更新失败',
        data: { conversationUpdates, error: (error as Error).message },
      })
    }
  }

  /**
   * 处理单个会话更新
   */
  private async handleConversationUpdate(conversationUpdate: any) {
    const { conversationId, tables } = conversationUpdate

    logger.debug(`处理会话更新: ${conversationId}`, { tables })

    if (tables && Array.isArray(tables)) {
      // 处理该会话的所有表更新
      for (const tableUpdate of tables) {
        await this.handleTableUpdate(tableUpdate)
      }
    } else {
      logger.warn(`会话 ${conversationId} 没有有效的表更新数据`, { conversationUpdate })
    }
  }

  /**
   * 处理单个表更新
   */
  private async handleTableUpdate(update: any) {
    const { table, data } = update

    // 从 data 数组中提取第一个数据项（通常只有一个）
    if (!data || !Array.isArray(data) || data.length === 0) {
      logger.warn(`表 ${table} 没有有效的更新数据`, { update })
      return
    }

    const updateData = data[0]

    switch (table) {
      case 'messages':
        const { conversationId: msgConversationId } = update
        await this.handleMessagesTableUpdate(msgConversationId, updateData.seq)
        break
      case 'conversations':
        const { conversationId } = update
        await this.handleConversationsTableUpdate(conversationId, updateData.version)
        break
      case 'user_conversations':
        const { userId, conversationId: userConvId } = update
        await this.handleUserConversationsTableUpdate(userConvId, updateData.version)
        break
      default:
        logger.warn(`未知的表更新类型: ${table}`, { update })
    }
  }

  /**
   * 处理消息表更新
   */
  private async handleMessagesTableUpdate(conversationId: string, version: number) {
    // 消息表更新表示有新消息，可以拉取最新消息
    const { useMessageStore } = await import('../pinia/message/message')
    const messageStore = useMessageStore()

    try {
      // 根据消息序列号拉取最新消息
      await messageStore.fetchMessagesBySeqRange(conversationId, version, version)
      logger.info(`消息表更新处理成功: conversation=${conversationId}, seq=${version}`)
    }
    catch (error) {
      logger.error(`消息表更新处理失败: conversation=${conversationId}, seq=${version}`, { error })
    }
  }

  /**
   * 处理会话表更新
   */
  private async handleConversationsTableUpdate(conversationId: string, version: number) {
    // 会话表更新，重新获取会话信息
    const { useConversationStore } = await import('../pinia/conversation/conversation')
    const conversationStore = useConversationStore()

    try {
      await conversationStore.initConversationById(conversationId)
      logger.info(`会话表更新处理成功: conversation=${conversationId}, version=${version}`)
    }
    catch (error) {
      logger.error(`会话表更新处理失败: conversation=${conversationId}, version=${version}`, { error })
    }
  }

  /**
   * 处理用户会话设置表更新
   */
  private async handleUserConversationsTableUpdate(conversationId: string, version: number) {
    // 用户会话设置表更新，重新获取会话信息
    const { useConversationStore } = await import('../pinia/conversation/conversation')
    const conversationStore = useConversationStore()

    try {
      await conversationStore.initConversationById(conversationId)
      logger.info(`用户会话设置表更新处理成功: conversation=${conversationId}, version=${version}`)
    }
    catch (error) {
      logger.error(`用户会话设置表更新处理失败: conversation=${conversationId}, version=${version}`, { error })
    }
  }

  /**
   * 处理用户会话设置表更新通知
   */
  private async handleUserConversationUpdate(data: any) {
    // 用户会话设置表更新的处理逻辑
    logger.info({
      text: '收到用户会话设置表更新通知',
      data,
    })
    // TODO: 实现用户会话设置表更新处理
  }
}

export default new DatabaseChatEventManager()
