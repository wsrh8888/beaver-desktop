import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { chatSyncApi } from 'mainModule/api/chat'
import { datasyncGetSyncChatMessagesApi } from 'mainModule/api/datasync'
import { MessageService } from 'mainModule/database/services/chat/message'
import { ChatSyncStatusService } from 'mainModule/database/services/chat/sync-status'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync-chat-message')
// 消息同步器 - 负责同步聊天消息数据
class MessageSync {
  // 检查并同步消息数据
  async checkAndSync() {
    logger.info({ text: '开始同步消息数据' })
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取本地最后同步时间
      const localCursor = await DataSyncService.get('chat_messages')
      const lastSyncTime = localCursor?.version || 0

      // 获取服务器上变更的消息版本信息
      const serverResponse = await datasyncGetSyncChatMessagesApi({
        since: lastSyncTime,
      })
      // 对比本地数据，过滤出需要同步消息的会话
      const needSyncConversations = await this.compareAndFilterMessageVersions(serverResponse.result.messageVersions)

      if (needSyncConversations.length > 0) {
        // 有需要同步消息的会话
        await this.syncMessagesForConversations(needSyncConversations)
      }

      // 更新游标（无论是否有变更都要更新）
      await DataSyncService.upsert({
        module: 'chat_messages',
        version: -1, // 使用时间戳而不是版本号
        updatedAt: serverResponse.result.serverTimestamp,
      }).catch(() => {})
    }
    catch (error) {
      logger.error({ text: '消息同步失败', data: { error: (error as any)?.message } })
    }
  }

  // 对比本地数据，过滤出需要同步消息的会话
  private async compareAndFilterMessageVersions(messageVersions: any[]): Promise<Array<{ conversationId: string, serverSeq: number }>> {
    if (messageVersions.length === 0) {
      return []
    }

    // 按会话分组获取服务器的最大seq
    const serverConversationMap = new Map<string, number>()
    messageVersions.forEach((item) => {
      const currentSeq = serverConversationMap.get(item.conversationId) || 0
      serverConversationMap.set(item.conversationId, Math.max(currentSeq, item.seq))
    })

    // 获取所有涉及的会话ID
    const conversationIds = Array.from(serverConversationMap.keys())

    // 批量查询本地消息同步状态
    const localVersions = await ChatSyncStatusService.getMessageVersions(conversationIds)
    const localVersionMap = new Map(localVersions.map(v => [v.conversationId, v.seq]))

    // 过滤出需要同步的会话（服务器seq > 本地seq）
    const needSyncConversations: Array<{ conversationId: string, serverSeq: number }> = []

    for (const [conversationId, serverSeq] of serverConversationMap) {
      const localSeq = localVersionMap.get(conversationId) || 0
      if (serverSeq > localSeq) {
        needSyncConversations.push({ conversationId, serverSeq })
      }
    }

    return needSyncConversations
  }

  // 同步指定会话的消息数据
  private async syncMessagesForConversations(conversationsWithSeq: Array<{ conversationId: string, serverSeq: number }>) {
    // 同步每个会话的消息
    for (const { conversationId, serverSeq } of conversationsWithSeq) {
      // 获取本地消息同步状态
      const localSyncStatus = await ChatSyncStatusService.getMessageSyncStatus(conversationId)
      const localSeq = localSyncStatus?.messageSeq || 0

      // 同步该会话的消息（从本地seq+1开始到服务器seq）
      await this.syncConversationMessages(
        conversationId,
        localSeq + 1,
        serverSeq,
      )

      // 更新消息同步状态
      await ChatSyncStatusService.upsertMessageSyncStatus(conversationId, serverSeq)
    }

    // 发送通知到render进程，告知消息数据已同步
    if (conversationsWithSeq.length > 0) {
      sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_UPDATE, {
        syncedConversations: conversationsWithSeq.map(item => ({
          conversationId: item.conversationId,
          syncedSeq: item.serverSeq,
        })),
      })
    }
  }

  // 同步单个会话的消息
  async syncConversationMessages(
    conversationId: string,
    fromSeq: number,
    toSeq: number,
  ) {
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
          targetMessageId: msg.targetMessageId || null, // 引用消息ID（撤回/删除等）
          msgPreview: msg.msgPreview,
          msg: msg.msg,
          seq: msg.seq,
          // sendStatus: 默认值1（已发送）- 服务端同步的消息
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

// 导出消息同步器实例
export default new MessageSync()
