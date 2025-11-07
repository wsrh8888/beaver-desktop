import type { IDBChatSyncStatus } from 'commonModule/type/database/chat'
import { eq, inArray } from 'drizzle-orm'
import { chatSyncStatus } from 'mainModule/database/tables'
import dbManager from '../../db'

export class ChatSyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取会话同步状态
  static async getConversationSyncStatus(conversationId: string): Promise<IDBChatSyncStatus | undefined> {
    return await this.db.select().from(chatSyncStatus).where(eq(chatSyncStatus.conversationId, conversationId)).get()
  }

  // 批量获取会话同步状态
  static async getConversationsSyncStatus(conversationIds: string[]): Promise<IDBChatSyncStatus[]> {
    if (conversationIds.length === 0)
      return []
    return await this.db.select().from(chatSyncStatus).where(inArray(chatSyncStatus.conversationId, conversationIds)).all()
  }

  // 获取所有会话同步状态
  static async getAllConversationsSyncStatus(): Promise<IDBChatSyncStatus[]> {
    return await this.db.select().from(chatSyncStatus).all()
  }

  // 更新或插入会话同步状态
  static async upsertConversationSyncStatus(
    conversationId: string,
    messageSeq: number = 0,
    conversationVersion: number = 0,
    settingVersion: number = 0,
  ): Promise<void> {
    await this.db
      .insert(chatSyncStatus)
      .values({
        conversationId,
        messageSeq,
        conversationVersion,
        settingVersion,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: chatSyncStatus.conversationId,
        set: {
          messageSeq,
          conversationVersion,
          settingVersion,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 批量更新会话同步状态
  static async batchUpsertConversationSyncStatus(statuses: Array<{
    conversationId: string
    messageSeq?: number
    conversationVersion?: number
    settingVersion?: number
  }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertConversationSyncStatus(
        status.conversationId,
        status.messageSeq || 0,
        status.conversationVersion || 0,
        status.settingVersion || 0,
      )
    }
  }

  // 删除会话同步状态
  static async deleteConversationSyncStatus(conversationId: string): Promise<any> {
    return await this.db.delete(chatSyncStatus).where(eq(chatSyncStatus.conversationId, conversationId)).run()
  }

  // 批量删除会话同步状态
  static async batchDeleteConversationSyncStatus(conversationIds: string[]): Promise<any> {
    return await this.db.delete(chatSyncStatus).where(inArray(chatSyncStatus.conversationId, conversationIds)).run()
  }

  // 获取需要同步的会话列表（基于消息序列号）
  static async getConversationsNeedSync(serverSeqs: Record<string, number>): Promise<string[]> {
    const localStatuses = await this.getAllConversationsSyncStatus()
    const statusMap = new Map(localStatuses.map(s => [s.conversationId, s]))

    const needSync: string[] = []

    for (const [conversationId, serverSeq] of Object.entries(serverSeqs)) {
      const localStatus = statusMap.get(conversationId)
      const localSeq = localStatus?.messageSeq || 0

      if (localSeq < serverSeq) {
        needSync.push(conversationId)
      }
    }

    return needSync
  }

  // 清空所有同步状态（用于重置）
  static async clearAllSyncStatus(): Promise<any> {
    return await this.db.delete(chatSyncStatus).run()
  }
}

export default ChatSyncStatusService
