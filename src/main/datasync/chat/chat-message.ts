import { chatSyncApi } from 'mainModule/api/chat'
import { datasyncGetSyncChatMessagesApi } from 'mainModule/api/datasync'
import { MessageService } from 'mainModule/database/services/chat/message'
import { ChatSyncStatusService } from 'mainModule/database/services/chat/sync-status'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 消息同步器 - 负责同步聊天消息数据
class MessageSync {
  // 检查并同步消息数据
  async checkAndSync() {
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
      console.log('1111111111111111111111111111111111111111111111111111111111111')
      console.log('1111111111111111111111111111111111111111111111111111111111111')
      console.log('1111111111111111111111111111111111111111111111111111111111111')
      console.log('1111111111111111111111111111111111111111111111111111111111111')
      console.log('1111111111111111111111111111111111111111111111111111111111111')

      console.log('服务器的数据', JSON.stringify(serverResponse))
      // 对比本地数据，过滤出需要同步消息的会话
      const needSyncConversations = await this.compareAndFilterMessageVersions(serverResponse.result.messageVersions)

      console.log('服务器的消息数据和本地的对比', JSON.stringify(needSyncConversations))
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

      logger.info({ text: '消息同步完成' }, 'MessageSync')
    }
    catch (error) {
      logger.error({ text: '消息同步失败', data: { error: (error as any)?.message } }, 'MessageSync')
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

    logger.info({
      text: '消息版本对比结果',
      data: {
        total: conversationIds.length,
        needSync: needSyncConversations.length,
        skipped: conversationIds.length - needSyncConversations.length,
      },
    }, 'MessageSync')

    return needSyncConversations
  }

  // 同步指定会话的消息数据
  private async syncMessagesForConversations(conversationsWithSeq: Array<{ conversationId: string, serverSeq: number }>) {
    logger.info({ text: '开始同步会话消息数据', data: { count: conversationsWithSeq.length } }, 'MessageSync')

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

    logger.info({ text: '会话消息数据同步完成', data: { conversationCount: conversationsWithSeq.length } }, 'MessageSync')
  }

  // 同步单个会话的消息
  async syncConversationMessages(
    conversationId: string,
    fromSeq: number,
    toSeq: number,
  ) {
    console.log('33333333333333333333333333333')
    console.log('33333333333333333333333333333')
    console.log('33333333333333333333333333333')

    console.log('开始同步了', conversationId, fromSeq, toSeq)
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
      console.log('调用chatSyncApi:', {
        conversationId,
        fromSeq: currentSeq,
        toSeq: Math.min(currentSeq + 99, toSeq),
        limit: 100,
      })

      const response = await chatSyncApi({
        conversationId, // 指定会话ID
        fromSeq: currentSeq,
        toSeq: Math.min(currentSeq + 99, toSeq),
        limit: 100,
      })
      console.log('5666666666666666666666666666666')
      console.log('5666666666666666666666666666666')
      console.log('5666666666666666666666666666666')
      console.log('chatSyncApi参数', JSON.stringify({
        conversationId, // 指定会话ID
        fromSeq: currentSeq,
        toSeq: Math.min(currentSeq + 99, toSeq),
        limit: 100,
      }))

      console.log('chatSyncApi响应:', JSON.stringify(response))

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

        console.log('准备批量创建消息:', messages.length, '条')
        console.log('第一条消息:', messages[0])

        await MessageService.batchCreate(messages)

        console.log('消息批量创建完成')

        currentSeq = Math.min(currentSeq + 99, toSeq) + 1
      }
      else {
        console.log('没有更多消息，结束同步')
        break
      }
    }
  }
}

// 导出消息同步器实例
export default new MessageSync()
