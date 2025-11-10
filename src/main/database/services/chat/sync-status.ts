// 聊天同步状态服务 - 使用独立的chatSyncStatus表
import { and, eq, inArray } from 'drizzle-orm'
import dbManager from '../../db'
import { chatSyncStatus } from '../../tables/chat/sync-status'

export class ChatSyncStatusService {
  static get db() {
    return dbManager.db
  }

  // 获取指定模块的同步状态
  static async getSyncStatus(module: string, conversationId: string) {
    return await this.db.select().from(chatSyncStatus).where(and(eq(chatSyncStatus.module, module), eq(chatSyncStatus.conversationId, conversationId))).get()
  }

  // 获取消息同步状态
  static async getMessageSyncStatus(conversationId: string) {
    return this.getSyncStatus('message', conversationId)
  }

  // 获取会话同步状态
  static async getConversationSyncStatus(conversationId: string) {
    return this.getSyncStatus('conversation', conversationId)
  }

  // 获取用户会话同步状态
  static async getUserConversationSyncStatus(conversationId: string) {
    return this.getSyncStatus('user_conversation', conversationId)
  }

  // 批量获取同步状态
  static async getSyncStatuses(module: string, conversationIds: string[]) {
    if (conversationIds.length === 0)
      return []
    return await this.db.select().from(chatSyncStatus).where(and(eq(chatSyncStatus.module, module), inArray(chatSyncStatus.conversationId, conversationIds))).all()
  }

  // 批量获取会话版本状态
  static async getConversationVersions(conversationIds: string[]): Promise<Array<{ conversationId: string, version: number }>> {
    const statuses = await this.getSyncStatuses('conversation', conversationIds)
    return statuses.map(status => ({
      conversationId: status.conversationId,
      version: status.version || 0,
    }))
  }

  // 批量获取消息版本状态
  static async getMessageVersions(conversationIds: string[]): Promise<Array<{ conversationId: string, seq: number }>> {
    const statuses = await this.getSyncStatuses('message', conversationIds)
    return statuses.map(status => ({
      conversationId: status.conversationId,
      seq: status.seq || 0,
    }))
  }

  // 批量获取用户会话版本状态
  static async getUserConversationVersions(conversationIds: string[]): Promise<Array<{ conversationId: string, version: number }>> {
    const statuses = await this.getSyncStatuses('user_conversation', conversationIds)
    return statuses.map(status => ({
      conversationId: status.conversationId,
      version: status.version || 0,
    }))
  }

  // 获取所有同步状态
  static async getAllSyncStatus() {
    return await this.db.select().from(chatSyncStatus).all()
  }

  // 更新或插入同步状态
  static async upsertSyncStatus(
    module: string,
    conversationId: string,
    seq: number = 0,
    version: number = 0,
  ): Promise<void> {
    await this.db
      .insert(chatSyncStatus)
      .values({
        module,
        conversationId,
        seq: module === 'message' ? seq : 0,
        version: module !== 'message' ? version : 0,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: [chatSyncStatus.conversationId, chatSyncStatus.module],
        set: {
          seq: module === 'message' ? seq : undefined,
          version: module !== 'message' ? version : undefined,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  // 更新消息同步状态
  static async upsertMessageSyncStatus(conversationId: string, seq: number): Promise<void> {
    return this.upsertSyncStatus('message', conversationId, seq, 0)
  }

  // 更新会话同步状态
  static async upsertConversationSyncStatus(conversationId: string, version: number): Promise<void> {
    return this.upsertSyncStatus('conversation', conversationId, 0, version)
  }

  // 更新用户会话同步状态
  static async upsertUserConversationSyncStatus(conversationId: string, version: number): Promise<void> {
    return this.upsertSyncStatus('user_conversation', conversationId, 0, version)
  }

  // 批量更新同步状态
  static async batchUpsertSyncStatus(statuses: Array<{
    module: string
    conversationId: string
    seq?: number
    version?: number
  }>): Promise<void> {
    for (const status of statuses) {
      await this.upsertSyncStatus(
        status.module,
        status.conversationId,
        status.seq || 0,
        status.version || 0,
      )
    }
  }

  // 删除同步状态
  static async deleteSyncStatus(module: string, conversationId: string) {
    return await this.db.delete(chatSyncStatus)
      .where(and(eq(chatSyncStatus.module, module), eq(chatSyncStatus.conversationId, conversationId)))
      .run()
  }

  // 批量删除同步状态
  static async batchDeleteSyncStatus(module: string, conversationIds: string[]) {
    if (conversationIds.length === 0)
      return
    return await this.db.delete(chatSyncStatus)
      .where(and(eq(chatSyncStatus.module, module), inArray(chatSyncStatus.conversationId, conversationIds)))
      .all()
  }

  // 获取需要同步的会话列表（基于消息序列号）
  static async getConversationsNeedMessageSync(serverSeqs: Record<string, number>): Promise<string[]> {
    const localStatuses = await this.getSyncStatuses('message', Object.keys(serverSeqs))
    const statusMap = new Map(localStatuses.map(s => [s.conversationId, s]))

    const needSync: string[] = []

    for (const [conversationId, serverSeq] of Object.entries(serverSeqs)) {
      const localStatus = statusMap.get(conversationId)
      const localSeq = localStatus?.seq || 0

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
