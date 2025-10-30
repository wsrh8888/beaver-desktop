import type { IDatasyncBase } from 'commonModule/type/database'
import { EDataType } from 'commonModule/type/ajax/datasync'
import { SyncStatus } from 'commonModule/type/datasync'
import { eq } from 'drizzle-orm'
import { chatSyncApi } from 'mainModule/api/chat'
import { getSyncCursorApi, updateSyncCursorApi } from 'mainModule/api/datasync'
import { ChatConversationService } from 'mainModule/database/services/chat/conversation'
import { MessageService } from 'mainModule/database/services/chat/message'
import { DataSyncService } from 'mainModule/database/services/datasync/datasync'
import { chatConversations } from 'mainModule/database/tables/chat/chat'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

// 消息表同步模块
class MessageSyncModule implements IDatasyncBase {
  syncStatus: SyncStatus = SyncStatus.PENDING

  // 检查并同步
  async checkAndSync() {
    const userId = store.get('userInfo')?.userId
    if (!userId)
      return

    try {
      // 获取服务器和本地序列号
      const serverCursor = await getSyncCursorApi({ dataType: EDataType.CHAT_MESSAGES })
      const localCursor = await DataSyncService.get(userId, process.custom.DEVICE_ID, EDataType.CHAT_MESSAGES)

      const localSeq = localCursor?.lastSeq || 0
      const serverSeq = serverCursor.result.lastSeq

      // 需要同步就同步
      if (serverSeq > localSeq) {
        await this.sync(localSeq, serverSeq)
        await this.updateCursor(userId, serverSeq)
      }
      else {
        logger.info({ text: '没有需要同步的内容', data: { localSeq, serverSeq } }, 'MessageSyncModule')
      }

      this.syncStatus = SyncStatus.COMPLETED
    }
    catch (error) {
      this.syncStatus = SyncStatus.FAILED
      logger.error({ text: '消息同步失败', data: { error: (error as any)?.message } }, 'MessageSyncModule')
    }
  }

  // 同步消息数据
  async sync(fromSeq: number, toSeq: number) {
    this.syncStatus = SyncStatus.SYNCING

    let currentSeq = fromSeq
    while (currentSeq <= toSeq) {
      const response = await chatSyncApi({
        fromSeq: currentSeq,
        toSeq: Math.min(currentSeq + 99, toSeq),
        limit: 100,
      })

      if (response.result.messages && response.result.messages.length > 0) {
        // 获取所有唯一的conversationId
        const conversationIds = [...new Set(response.result.messages.map(msg => msg.conversationId))]

        // 批量查询会话类型
        const conversationTypes: Record<string, number> = {}
        for (const conversationId of conversationIds) {
          const conversation = await ChatConversationService.db
            .select({ type: chatConversations.type })
            .from(chatConversations)
            .where(eq(chatConversations.conversationId, conversationId))
            .get()

          conversationTypes[conversationId] = conversation?.type || 1 // 默认为私聊
        }

        const messages = response.result.messages.map(msg => ({
          messageId: msg.messageId,
          conversationId: msg.conversationId,
          conversationType: conversationTypes[msg.conversationId] || 1,
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

  // 更新游标
  private async updateCursor(userId: string, lastSeq: number) {
    await DataSyncService.upsert({
      userId,
      deviceId: process.custom.DEVICE_ID,
      dataType: EDataType.CHAT_MESSAGES,
      lastSeq,
      syncStatus: SyncStatus.COMPLETED,
    })

    await updateSyncCursorApi({
      dataType: EDataType.CHAT_MESSAGES,
      lastSeq,
    })
  }

  async getStatus() {
    return this.syncStatus
  }
}

// 导出消息同步模块实例
export default new MessageSyncModule()
